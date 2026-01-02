use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("5MRKYXP3y54CEqDsuEGnieLwYGrGkTQNG34xcpbWEoW7");

#[program]
pub mod orange_staking {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        reward_duration: i64,
        min_stake_amount: u64,
        instant_unstake_fee: u16,
    ) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.stake_mint = ctx.accounts.stake_mint.key();
        pool.stake_vault = ctx.accounts.stake_vault.key();
        pool.reward_vault = ctx.accounts.reward_vault.key();
        pool.total_staked = 0;
        pool.reward_duration = reward_duration;
        pool.last_reward_time = Clock::get()?.unix_timestamp;
        pool.reward_per_token_stored = 0;
        pool.min_stake_amount = min_stake_amount;
        pool.instant_unstake_fee = instant_unstake_fee;
        pool.total_stakers = 0;
        pool.bump = ctx.bumps.pool;
        msg!("Orange Staking Pool initialized!");
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;
        let clock = Clock::get()?;
        
        require!(amount >= pool.min_stake_amount, ErrorCode::BelowMinimumStake);
        update_rewards(pool, user_stake)?;
        
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: ctx.accounts.stake_vault.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        token::transfer(CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts), amount)?;
        
        if user_stake.staked_amount == 0 {
            pool.total_stakers += 1;
            user_stake.owner = ctx.accounts.user.key();
            user_stake.pool = pool.key();
            user_stake.stake_time = clock.unix_timestamp;
        }
        
        user_stake.staked_amount += amount;
        pool.total_staked += amount;
        
        emit!(StakeEvent { user: ctx.accounts.user.key(), amount, total_staked: user_stake.staked_amount, timestamp: clock.unix_timestamp });
        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        require!(amount > 0 && user_stake.staked_amount >= amount, ErrorCode::InsufficientStake);
        update_rewards(pool, user_stake)?;
        
        let seeds = &[b"pool".as_ref(), pool.stake_mint.as_ref(), &[pool.bump]];
        let cpi_accounts = Transfer {
            from: ctx.accounts.stake_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: pool.to_account_info(),
        };
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, &[seeds]), amount)?;
        
        user_stake.staked_amount -= amount;
        pool.total_staked -= amount;
        if user_stake.staked_amount == 0 { pool.total_stakers -= 1; }
        
        emit!(UnstakeEvent { user: ctx.accounts.user.key(), amount, remaining: user_stake.staked_amount, timestamp: Clock::get()?.unix_timestamp });
        Ok(())
    }

    pub fn instant_unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        require!(amount > 0 && user_stake.staked_amount >= amount, ErrorCode::InsufficientStake);
        update_rewards(pool, user_stake)?;
        
        let fee = (amount as u128 * pool.instant_unstake_fee as u128 / 10000) as u64;
        let amount_after_fee = amount - fee;
        
        let seeds = &[b"pool".as_ref(), pool.stake_mint.as_ref(), &[pool.bump]];
        let cpi_accounts = Transfer {
            from: ctx.accounts.stake_vault.to_account_info(),
            to: ctx.accounts.user_token_account.to_account_info(),
            authority: pool.to_account_info(),
        };
        token::transfer(CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, &[seeds]), amount_after_fee)?;
        
        user_stake.staked_amount -= amount;
        pool.total_staked -= amount_after_fee;
        if user_stake.staked_amount == 0 { pool.total_stakers -= 1; }
        
        emit!(InstantUnstakeEvent { user: ctx.accounts.user.key(), amount, fee, received: amount_after_fee, timestamp: Clock::get()?.unix_timestamp });
        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let user_stake = &mut ctx.accounts.user_stake;
        
        update_rewards(pool, user_stake)?;
        let rewards = user_stake.pending_rewards;
        require!(rewards > 0, ErrorCode::NoRewardsToClaim);
        
        **ctx.accounts.reward_vault.to_account_info().try_borrow_mut_lamports()? -= rewards;
        **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? += rewards;
        
        user_stake.pending_rewards = 0;
        user_stake.total_rewards_claimed += rewards;
        
        emit!(ClaimEvent { user: ctx.accounts.user.key(), amount: rewards, timestamp: Clock::get()?.unix_timestamp });
        Ok(())
    }

    pub fn deposit_rewards(ctx: Context<DepositRewards>, amount: u64) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        require!(ctx.accounts.authority.key() == pool.authority, ErrorCode::Unauthorized);
        
        let ix = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.authority.key(),
            &ctx.accounts.reward_vault.key(),
            amount,
        );
        anchor_lang::solana_program::program::invoke(&ix, &[
            ctx.accounts.authority.to_account_info(),
            ctx.accounts.reward_vault.to_account_info(),
        ])?;
        
        if pool.total_staked > 0 {
            pool.reward_per_token_stored += (amount as u128 * 1_000_000_000_000_000_000) / pool.total_staked as u128;
        }
        pool.last_reward_time = Clock::get()?.unix_timestamp;
        
        emit!(RewardDepositEvent { depositor: ctx.accounts.authority.key(), amount, timestamp: Clock::get()?.unix_timestamp });
        Ok(())
    }
}

fn update_rewards(pool: &mut Account<StakingPool>, user_stake: &mut Account<UserStake>) -> Result<()> {
    if user_stake.staked_amount > 0 {
        let reward_diff = pool.reward_per_token_stored - user_stake.reward_per_token_paid;
        user_stake.pending_rewards += ((user_stake.staked_amount as u128 * reward_diff) / 1_000_000_000_000_000_000) as u64;
    }
    user_stake.reward_per_token_paid = pool.reward_per_token_stored;
    Ok(())
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + StakingPool::INIT_SPACE, seeds = [b"pool", stake_mint.key().as_ref()], bump)]
    pub pool: Account<'info, StakingPool>,
    pub stake_mint: Account<'info, Mint>,
    #[account(init, payer = authority, token::mint = stake_mint, token::authority = pool, seeds = [b"stake_vault", pool.key().as_ref()], bump)]
    pub stake_vault: Account<'info, TokenAccount>,
    /// CHECK: SOL reward vault
    #[account(mut, seeds = [b"reward_vault", pool.key().as_ref()], bump)]
    pub reward_vault: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut, seeds = [b"pool", pool.stake_mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakingPool>,
    #[account(init_if_needed, payer = user, space = 8 + UserStake::INIT_SPACE, seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()], bump)]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut, constraint = stake_vault.key() == pool.stake_vault)]
    pub stake_vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = user_token_account.mint == pool.stake_mint && user_token_account.owner == user.key())]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut, seeds = [b"pool", pool.stake_mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut, seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()], bump, constraint = user_stake.owner == user.key())]
    pub user_stake: Account<'info, UserStake>,
    #[account(mut, constraint = stake_vault.key() == pool.stake_vault)]
    pub stake_vault: Account<'info, TokenAccount>,
    #[account(mut, constraint = user_token_account.mint == pool.stake_mint && user_token_account.owner == user.key())]
    pub user_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut, seeds = [b"pool", pool.stake_mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut, seeds = [b"user_stake", pool.key().as_ref(), user.key().as_ref()], bump, constraint = user_stake.owner == user.key())]
    pub user_stake: Account<'info, UserStake>,
    /// CHECK: SOL reward vault
    #[account(mut, seeds = [b"reward_vault", pool.key().as_ref()], bump)]
    pub reward_vault: AccountInfo<'info>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositRewards<'info> {
    #[account(mut, seeds = [b"pool", pool.stake_mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakingPool>,
    /// CHECK: SOL reward vault
    #[account(mut, seeds = [b"reward_vault", pool.key().as_ref()], bump)]
    pub reward_vault: AccountInfo<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct StakingPool {
    pub authority: Pubkey,
    pub stake_mint: Pubkey,
    pub stake_vault: Pubkey,
    pub reward_vault: Pubkey,
    pub total_staked: u64,
    pub total_stakers: u64,
    pub reward_duration: i64,
    pub last_reward_time: i64,
    pub reward_per_token_stored: u128,
    pub min_stake_amount: u64,
    pub instant_unstake_fee: u16,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct UserStake {
    pub owner: Pubkey,
    pub pool: Pubkey,
    pub staked_amount: u64,
    pub stake_time: i64,
    pub reward_per_token_paid: u128,
    pub pending_rewards: u64,
    pub total_rewards_claimed: u64,
}

#[event]
pub struct StakeEvent { pub user: Pubkey, pub amount: u64, pub total_staked: u64, pub timestamp: i64 }
#[event]
pub struct UnstakeEvent { pub user: Pubkey, pub amount: u64, pub remaining: u64, pub timestamp: i64 }
#[event]
pub struct InstantUnstakeEvent { pub user: Pubkey, pub amount: u64, pub fee: u64, pub received: u64, pub timestamp: i64 }
#[event]
pub struct ClaimEvent { pub user: Pubkey, pub amount: u64, pub timestamp: i64 }
#[event]
pub struct RewardDepositEvent { pub depositor: Pubkey, pub amount: u64, pub timestamp: i64 }

#[error_code]
pub enum ErrorCode {
    #[msg("Below minimum stake")] BelowMinimumStake,
    #[msg("Insufficient stake")] InsufficientStake,
    #[msg("No rewards to claim")] NoRewardsToClaim,
    #[msg("Unauthorized")] Unauthorized,
}
