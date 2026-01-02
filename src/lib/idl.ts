export type OrangeStaking = {
  version: "0.1.0";
  name: "orange_staking";
  instructions: [
    {
      name: "initialize";
      accounts: [
        { name: "pool"; isMut: true; isSigner: false },
        { name: "stakeMint"; isMut: false; isSigner: false },
        { name: "stakeVault"; isMut: true; isSigner: false },
        { name: "rewardVault"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "tokenProgram"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false },
        { name: "rent"; isMut: false; isSigner: false }
      ];
      args: [
        { name: "rewardDuration"; type: "i64" },
        { name: "minStakeAmount"; type: "u64" },
        { name: "instantUnstakeFee"; type: "u16" }
      ];
    },
    {
      name: "stake";
      accounts: [
        { name: "pool"; isMut: true; isSigner: false },
        { name: "userStake"; isMut: true; isSigner: false },
        { name: "stakeVault"; isMut: true; isSigner: false },
        { name: "userTokenAccount"; isMut: true; isSigner: false },
        { name: "user"; isMut: true; isSigner: true },
        { name: "tokenProgram"; isMut: false; isSigner: false },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "amount"; type: "u64" }];
    },
    {
      name: "unstake";
      accounts: [
        { name: "pool"; isMut: true; isSigner: false },
        { name: "userStake"; isMut: true; isSigner: false },
        { name: "stakeVault"; isMut: true; isSigner: false },
        { name: "userTokenAccount"; isMut: true; isSigner: false },
        { name: "user"; isMut: true; isSigner: true },
        { name: "tokenProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "amount"; type: "u64" }];
    },
    {
      name: "instantUnstake";
      accounts: [
        { name: "pool"; isMut: true; isSigner: false },
        { name: "userStake"; isMut: true; isSigner: false },
        { name: "stakeVault"; isMut: true; isSigner: false },
        { name: "userTokenAccount"; isMut: true; isSigner: false },
        { name: "user"; isMut: true; isSigner: true },
        { name: "tokenProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "amount"; type: "u64" }];
    },
    {
      name: "claimRewards";
      accounts: [
        { name: "pool"; isMut: true; isSigner: false },
        { name: "userStake"; isMut: true; isSigner: false },
        { name: "rewardVault"; isMut: true; isSigner: false },
        { name: "user"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [];
    },
    {
      name: "depositRewards";
      accounts: [
        { name: "pool"; isMut: true; isSigner: false },
        { name: "rewardVault"; isMut: true; isSigner: false },
        { name: "authority"; isMut: true; isSigner: true },
        { name: "systemProgram"; isMut: false; isSigner: false }
      ];
      args: [{ name: "amount"; type: "u64" }];
    }
  ];
  accounts: [
    {
      name: "stakingPool";
      type: {
        kind: "struct";
        fields: [
          { name: "authority"; type: "publicKey" },
          { name: "stakeMint"; type: "publicKey" },
          { name: "stakeVault"; type: "publicKey" },
          { name: "rewardVault"; type: "publicKey" },
          { name: "totalStaked"; type: "u64" },
          { name: "totalStakers"; type: "u64" },
          { name: "rewardDuration"; type: "i64" },
          { name: "lastRewardTime"; type: "i64" },
          { name: "rewardPerTokenStored"; type: "u128" },
          { name: "minStakeAmount"; type: "u64" },
          { name: "instantUnstakeFee"; type: "u16" },
          { name: "bump"; type: "u8" }
        ];
      };
    },
    {
      name: "userStake";
      type: {
        kind: "struct";
        fields: [
          { name: "owner"; type: "publicKey" },
          { name: "pool"; type: "publicKey" },
          { name: "stakedAmount"; type: "u64" },
          { name: "stakeTime"; type: "i64" },
          { name: "rewardPerTokenPaid"; type: "u128" },
          { name: "pendingRewards"; type: "u64" },
          { name: "totalRewardsClaimed"; type: "u64" }
        ];
      };
    }
  ];
  events: [
    { name: "StakeEvent"; fields: [{ name: "user"; type: "publicKey" }, { name: "amount"; type: "u64" }, { name: "totalStaked"; type: "u64" }, { name: "timestamp"; type: "i64" }] },
    { name: "UnstakeEvent"; fields: [{ name: "user"; type: "publicKey" }, { name: "amount"; type: "u64" }, { name: "remaining"; type: "u64" }, { name: "timestamp"; type: "i64" }] },
    { name: "ClaimEvent"; fields: [{ name: "user"; type: "publicKey" }, { name: "amount"; type: "u64" }, { name: "timestamp"; type: "i64" }] }
  ];
  errors: [
    { code: 6000; name: "BelowMinimumStake"; msg: "Below minimum stake" },
    { code: 6001; name: "InsufficientStake"; msg: "Insufficient stake" },
    { code: 6002; name: "NoRewardsToClaim"; msg: "No rewards to claim" },
    { code: 6003; name: "Unauthorized"; msg: "Unauthorized" }
  ];
};

export const IDL: OrangeStaking = {
  version: "0.1.0",
  name: "orange_staking",
  instructions: [
    {
      name: "initialize",
      accounts: [
        { name: "pool", isMut: true, isSigner: false },
        { name: "stakeMint", isMut: false, isSigner: false },
        { name: "stakeVault", isMut: true, isSigner: false },
        { name: "rewardVault", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
        { name: "rent", isMut: false, isSigner: false },
      ],
      args: [
        { name: "rewardDuration", type: "i64" },
        { name: "minStakeAmount", type: "u64" },
        { name: "instantUnstakeFee", type: "u16" },
      ],
    },
    {
      name: "stake",
      accounts: [
        { name: "pool", isMut: true, isSigner: false },
        { name: "userStake", isMut: true, isSigner: false },
        { name: "stakeVault", isMut: true, isSigner: false },
        { name: "userTokenAccount", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
    {
      name: "unstake",
      accounts: [
        { name: "pool", isMut: true, isSigner: false },
        { name: "userStake", isMut: true, isSigner: false },
        { name: "stakeVault", isMut: true, isSigner: false },
        { name: "userTokenAccount", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
    {
      name: "instantUnstake",
      accounts: [
        { name: "pool", isMut: true, isSigner: false },
        { name: "userStake", isMut: true, isSigner: false },
        { name: "stakeVault", isMut: true, isSigner: false },
        { name: "userTokenAccount", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "tokenProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
    {
      name: "claimRewards",
      accounts: [
        { name: "pool", isMut: true, isSigner: false },
        { name: "userStake", isMut: true, isSigner: false },
        { name: "rewardVault", isMut: true, isSigner: false },
        { name: "user", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [],
    },
    {
      name: "depositRewards",
      accounts: [
        { name: "pool", isMut: true, isSigner: false },
        { name: "rewardVault", isMut: true, isSigner: false },
        { name: "authority", isMut: true, isSigner: true },
        { name: "systemProgram", isMut: false, isSigner: false },
      ],
      args: [{ name: "amount", type: "u64" }],
    },
  ],
  accounts: [
    {
      name: "stakingPool",
      type: {
        kind: "struct",
        fields: [
          { name: "authority", type: "publicKey" },
          { name: "stakeMint", type: "publicKey" },
          { name: "stakeVault", type: "publicKey" },
          { name: "rewardVault", type: "publicKey" },
          { name: "totalStaked", type: "u64" },
          { name: "totalStakers", type: "u64" },
          { name: "rewardDuration", type: "i64" },
          { name: "lastRewardTime", type: "i64" },
          { name: "rewardPerTokenStored", type: "u128" },
          { name: "minStakeAmount", type: "u64" },
          { name: "instantUnstakeFee", type: "u16" },
          { name: "bump", type: "u8" },
        ],
      },
    },
    {
      name: "userStake",
      type: {
        kind: "struct",
        fields: [
          { name: "owner", type: "publicKey" },
          { name: "pool", type: "publicKey" },
          { name: "stakedAmount", type: "u64" },
          { name: "stakeTime", type: "i64" },
          { name: "rewardPerTokenPaid", type: "u128" },
          { name: "pendingRewards", type: "u64" },
          { name: "totalRewardsClaimed", type: "u64" },
        ],
      },
    },
  ],
  events: [
    { name: "StakeEvent", fields: [{ name: "user", type: "publicKey" }, { name: "amount", type: "u64" }, { name: "totalStaked", type: "u64" }, { name: "timestamp", type: "i64" }] },
    { name: "UnstakeEvent", fields: [{ name: "user", type: "publicKey" }, { name: "amount", type: "u64" }, { name: "remaining", type: "u64" }, { name: "timestamp", type: "i64" }] },
    { name: "ClaimEvent", fields: [{ name: "user", type: "publicKey" }, { name: "amount", type: "u64" }, { name: "timestamp", type: "i64" }] },
  ],
  errors: [
    { code: 6000, name: "BelowMinimumStake", msg: "Below minimum stake" },
    { code: 6001, name: "InsufficientStake", msg: "Insufficient stake" },
    { code: 6002, name: "NoRewardsToClaim", msg: "No rewards to claim" },
    { code: 6003, name: "Unauthorized", msg: "Unauthorized" },
  ],
};
