# JUPITER CASH 🚀

**Automated USDC Cashback on Solana Swap Fees**

---

## 🌟 TL;DR

Integrator fee: `feeBps = 10` (0.10%) on swaps routed via Jupiter.

### 💰 Cashback tiers (progressive, anti-dust)

| GASD balance at snapshot | Cashback rate on fees |
|--------------------------|-----------------------|
| < 100 GASD               | 50%                   |
| ≥ 100 GASD               | 60%                   |
| ≥ 500 GASD               | 70%                   |
| ≥ 1,000 GASD             | 80%                   |

**Payout**: Weekly in USDC to the same wallet used for swaps.

**Snapshot**: Monday 12:00 CET (Europe/Zurich).

---

## 💎 GAS DIAMOND (GASD) Token

**Token Name**: GAS DIAMOND  
**Symbol**: GASD  
**Mint Address**: `662SG2n8Jk4HVzQDiFamQCUsHsde8nFEj7EsAEcGyhi2`  
**Decimals**: 9

### 📍 How to acquire GASD

GASD tokens can be acquired through our community channels and partner exchanges. 
The token is designed for cashback tier benefits in the GasBack Lite system.

To view GASD in your wallet:
1. Open Phantom or Backpack wallet
2. Click "Add Token" or "Import Token"
3. Enter the mint address: `662SG2n8Jk4HVzQDiFamQCUsHsde8nFEj7EsAEcGyhi2`
4. Confirm to add GASD to your wallet

### 🖼️ Token Logo

The GASD token logo is available in the project repository. For wallet integrations 
and token listings, please refer to the official token information.

---

## 📖 How It Works (User)

1. **Open** the GasBack Lite swap page (Jupiter widget embedded)
2. **Connect** your wallet (Phantom, Backpack, …) and swap as usual
3. **Each Monday** we compute your cashback from the fees your swaps generated
4. **Receive** USDC weekly. Hold GASD before the snapshot to unlock higher tiers

> 💡 Nothing changes in your trading flow—just weekly rebates!

---

## 🔍 Transparency

We publish two files each week in the repo:

- `data/volumes.csv` — estimated weekly swap volume per wallet
- `data/payout.csv` — USDC amounts to be paid per wallet + applied tier

Fee inflows land on our public USDC fee account(s) on Solana.

No personal data—only wallet addresses.

---

## 📊 What Counts Toward Cashback

### ✅ Included
- Swaps performed through the GasBack Lite page (with integrator fee enabled)

### ❌ Excluded
- Failed/canceled swaps
- Swaps routed elsewhere
- Dust-size payouts (we may roll over tiny amounts to the next week)

### 🧮 Cashback formula (per wallet i)

```
Estimated volume_i  ≈  Σ( fee_usdc_tx × 10000 / feeBps )
Cashback_i          =  Estimated volume_i × (feeBps / 10000) × tier_i
```

Where `tier_i ∈ {0.50, 0.60, 0.70, 0.80}` from the table above.

### 📈 Example

With `feeBps = 10` (0.10%) and $100,000 weekly volume:

- Fees = $100 → Standard (50%) pays $50
- Fees = $100 → Premium-max (80%) pays $80

---

## 🚀 Quick Start (User)

**Visit**: https://<your-domain>/swap.html

**(Optional)** Use prefilled links from our bot:

```
https://<your-domain>/swap.html?in=<MINT_IN>&out=<MINT_OUT>&amt=0.75&slip=75&feeBps=10
```

**Connect** → **review** → **Swap**

Hold GASD before Monday 12:00 CET to reach better tiers.

---

## ⚙️ Setup (Operator)

### 🎯 Goal
Serverless calculations via GitHub Actions, manual payouts locally (safer).

### 📁 Files & scripts (already in this repo)

| File/Directory | Description |
|----------------|-------------|
| `swap.html` | Single static page that embeds Jupiter Terminal with platformFee enabled |
| `.github/workflows/snapshot.yml` | Captures GASD balances each Monday 12:00 CET |
| `.github/workflows/weekly.yml` | Computes volumes.csv and payout.csv each Monday 12:05 CET |
| `scripts/build_volumes.js` | Aggregates weekly estimated volumes from on-chain fee inflows |
| `scripts/snapshot_gasd.js` | Snapshots GASD balances for wallets seen in volumes.csv |
| `scripts/build_payout.js` | Applies tiers (50/60/70/80%) and writes payout.csv |
| `scripts/pay_usdc_local.js` | Local USDC payout sender (run on your laptop) |

### 🔧 Required configuration

#### Repository → Settings → Actions → Variables
- `GASD_MINT` — SPL mint address of GASD

#### Repository → Settings → Actions → Secrets
- `FEE_USDC_ATA` — your USDC ATA that receives Jupiter integrator fees

#### In swap.html
- Set `platformFeeAndAccounts.feeBps = 10`
- Add fee accounts as needed (start with USDC only)

### 📅 Cron calendar (defaults)

- **Snapshot**: Monday 12:00 CET (Europe/Zurich)
- **Weekly aggregation**: Monday 12:05 CET

You can trigger either workflow manually from the Actions tab.

---

## 💸 Payout (Operator)

We recommend manual local payout for security:

1. Pull the repo to your machine (contains data/payout.csv)
2. Export your private key locally (never commit/secrets in cloud)
3. Run:

```bash
export PAYER_PRIVATE_KEY=<base58_secret_key_local_only>
node scripts/pay_usdc_local.js CSV_PATH=data/payout.csv WEEKLY_CAP_USDC=2000
```

All txids are visible on-chain. You can append them to a log for audit.

---

## 🔒 Security Notes

| Feature | Description |
|---------|-------------|
| **No custody** | Swaps route via Jupiter; users sign in their own wallets |
| **No hot wallet in CI** | Payouts run locally |
| **Tier anti-dust** | < 100 GASD stays at 50% (prevents "dust" gaming) |
| **Rate caps** | Maximum cashback rate is 80% (never more) |
| **Roll-over** | We may roll tiny payouts to the next week to avoid dust |

---

## ⚙️ Parameters (change if needed)

| Parameter | Value |
|-----------|-------|
| **feeBps** (integrator fee) | 10 bps (0.10%) |
| **Tiers** | <100:50%, ≥100:60%, ≥500:70%, ≥1000:80% |
| **Snapshot** | Monday 12:00 CET |
| **Payout asset** | USDC (Solana) |
| **Initial pairs** | SOL ↔ USDC (expand later) |

---

## 🏷️ White-Label (Optional)

Communities/influencers can get:

- A branded URL (separate fee accounts)
- A public GMV/fees dashboard
- A rev-share from our margin (users keep their 50/60/70/80% rates)

---

## ❓ FAQ

### Do I need an account?
No. Connect wallet, swap, and receive weekly USDC.

### When is the snapshot taken?
Every Monday 12:00 CET. Hold GASD before that time to qualify for higher tiers.

### What if my payout is tiny?
Very small amounts may be rolled to next week to avoid dust.

### Can tiers change?
Yes, parameters may evolve—but we announce changes at least 1 week in advance and update this README.

### Is there a guarantee of earnings?
No. Cashback depends on actual swap volumes and fees collected. GASD does not guarantee yield; it only adjusts the split.

---

## 📞 Contact

- **Support**: hello@jupiter-cash.com
- **Status / CSVs**: see the data/ folder in this repo (updated weekly)
