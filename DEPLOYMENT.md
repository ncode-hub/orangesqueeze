# Deployment Guide - Hostinger Node.js

## Langkah-langkah Deploy

### 1. Build Locally
```bash
npm run build
```

### 2. Files yang perlu di-upload ke Hostinger

Upload semua file KECUALI:
- `node_modules/` (akan di-install di server)
- `.next/cache/` (optional, bisa skip)

**Files penting:**
```
.next/           (folder hasil build)
public/          (static assets)
src/             (source code)
package.json
package-lock.json
next.config.mjs
postcss.config.mjs
tailwind.config.ts
tsconfig.json
server.js        (custom server)
```

### 3. Setup di Hostinger

1. **Login ke Hostinger Panel** → Hosting → Manage

2. **Buka Node.js Settings:**
   - Node.js Version: 18.x atau 20.x
   - Application mode: Production
   - Application root: `/` (atau folder dimana upload)
   - Application URL: domain kamu
   - Application startup file: `server.js`

3. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=3000
   ```

4. **Upload Files:**
   - Via File Manager atau FTP
   - Upload semua files ke public_html atau folder app

5. **Install Dependencies:**
   - Buka Terminal/SSH di Hostinger
   ```bash
   cd ~/public_html  # atau folder app kamu
   npm install --production
   ```

6. **Build (jika belum):**
   ```bash
   npm run build
   ```

7. **Start App:**
   - Klik "Restart" di Node.js settings
   - Atau via terminal: `npm start`

### 4. Troubleshooting

**Error: Module not found**
```bash
npm install
```

**Error: Port already in use**
- Pastikan PORT di env variables sama dengan setting Hostinger

**App tidak jalan**
- Check logs di Hostinger panel
- Pastikan `server.js` sebagai startup file

### 5. Update Deployment

Setiap kali update code:
1. Build locally: `npm run build`
2. Upload folder `.next/` yang baru
3. Restart app di Hostinger

---

## Alternative: Static Export (Lebih Simple)

Jika Hostinger tidak support Node.js dengan baik, bisa export static:

1. Update `next.config.mjs`:
```js
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  }
};
export default nextConfig;
```

2. Build:
```bash
npm run build
```

3. Upload folder `out/` ke public_html

**Note:** Static export tidak support API routes dan beberapa fitur Next.js

---

## Production Checklist

- [ ] Build success tanpa error
- [ ] Test semua fitur di local production mode
- [ ] Environment variables sudah di-set
- [ ] Domain/SSL configured
- [ ] Wallet connection works
- [ ] Transactions work on devnet

## Mainnet Deployment (Future)

Untuk mainnet, update di `src/lib/constants.ts`:
```typescript
export const NETWORK = "mainnet-beta";
export const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
// Atau gunakan RPC berbayar (Helius, QuickNode) untuk rate limit lebih tinggi
```
