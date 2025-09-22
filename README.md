# JUPITER CASH 🚀

**Automated USDC Cashback on Solana Swap Fees**

---

## 🌟 TL;DR

Integrator fee: `feeBps = 10` (0.10%) on swaps routed via Jupiter.

**🎯 Earn GASD by swapping**: 1 GASD = $1 USD swap volume (distributed weekly)

### 💰 Cashback tiers (progressive, anti-dust)

| GASD balance at snapshot | Cashback rate on fees |
|--------------------------|-----------------------|
| < 100 GASD               | 50%                   |
| ≥ 300 GASD               | 60%                   |
| ≥ 500 GASD               | 70%                   |
| ≥ 1,000 GASD             | 80%                   |

**Payout**: Weekly in USDC to the same wallet used for swaps.

**Snapshot**: Monday 12:00 CET (Europe/Zurich).

---

## 🔥 Direct Burn Mechanism (NEW)

To enhance token value and provide benefits to all GASD holders, we've implemented a direct burn mechanism:

- **2% of all swap fees** are directly sent to a burn wallet
- The burn wallet can **only burn tokens** - no other operations possible
- **No staking required** - simply hold GASD tokens to benefit from supply reduction
- Automatic burn transactions executed immediately upon fee receipt

### Example with $100 USD trade:
- Swap volume: $100 USD
- Fees collected: $0.10 USD (10 bps)
- Distribution:
  - User cashback (80%): $0.08 USD
  - Direct GASD burn (2%): $0.002 USD (sent to burn wallet)
  - Platform reserve (18%): $0.018 USD

This mechanism directly reduces the circulating supply of GASD tokens, potentially increasing their value over time.

---

## 💎 GAS DIAMOND (GASD) Token

**Token Name**: GAS DIAMOND  
**Symbol**: GASD  
**Mint Address**: `662SG2n8Jk4HVzQDiFamQCUsHsde8nFEj7EsAEcGyhi2`  
**Decimals**: 9

### 📍 How to earn GASD

GASD tokens are **automatically earned** with every swap you make on Jupiter Cash! 
The more you trade, the more GASD you accumulate, and the higher your cashback tier becomes.

**Earning Rate**: You earn GASD tokens proportional to your swap volume:
- **1 GASD = $1 USD** in swap volume
- Example: $500 swap = 500 GASD earned
- GASD tokens are distributed weekly along with your cashback

To view your earned GASD in your wallet:
1. Open Phantom or Backpack wallet
2. Click "Add Token" or "Import Token"
3. Enter the mint address: `662SG2n8Jk4HVzQDiFamQCUsHsde8nFEj7EsAEcGyhi2`
4. Confirm to add GASD to your wallet

### 🖼️ Token Logo

The GASD token logo is available in the project repository. For wallet integrations 
and token listings, please refer to the official token information.

---

## 📖 How It Works (User)

1. **Open** the Jupiter Cash swap page (Jupiter widget embedded)
2. **Connect** your wallet (Phantom, Backpack, …) and swap as usual
3. **Earn GASD automatically**: For every $1 USD in swap volume, you earn 1 GASD token
4. **Each Monday** we compute your cashback from the fees your swaps generated
5. **Receive** USDC weekly + your earned GASD tokens. Higher GASD balance = higher cashback tier

> 💡 The more you swap, the more GASD you earn, and the better your cashback rate becomes!
> 🔥 2% of fees are automatically burned to reduce token supply and increase value!

---

## 🔍 Transparency

We publish three files each week in the repo:

- `data/volumes.csv` — estimated weekly swap volume per wallet
- `data/payout.csv` — USDC amounts to be paid per wallet + applied tier
- `data/gasd_earned.csv` — GASD tokens earned per wallet based on swap volume
- `data/fee_summary.json` — Summary of fee distribution including burn amounts

Fee inflows land on our public USDC fee account(s) on Solana.

No personal data—only wallet addresses.

---

## 📊 What Counts Toward Cashback & GASD Earning

### ✅ Included
- Swaps performed through the Jupiter Cash page (with integrator fee enabled)
- GASD tokens are earned automatically: 1 GASD = $1 USD swap volume

### ❌ Excluded
- Failed/canceled swaps
- Swaps routed elsewhere
- Dust-size payouts (we may roll over tiny amounts to the next week)

### 🧮 Formulas (per wallet i)

```
Estimated volume_i  ≈  Σ( fee_usdc_tx × 10000 / feeBps )
GASD earned_i       =  Estimated volume_i × 1  (1 GASD per $1 USD volume)
Cashback_i          =  Estimated volume_i × (feeBps / 10000) × tier_i
Burn_amount         =  Estimated volume_i × (200 / 10000)  (2% of fees)
Platform_amount     =  Estimated volume_i × (180 / 10000)  (18% of fees)
```

Where `tier_i ∈ {0.50, 0.60, 0.70, 0.80}` from the table above.

### 📈 Example

With `feeBps = 10` (0.10%) and $100,000 weekly volume:

- Total fees = $100
- User cashback (80% max) = $80
- Direct burn (2%) = $2
- Platform reserve (18%) = $18

---

## 🚀 Quick Start (User)

**Visit**: https://jupiter-cash.com

**(Optional)** Use prefilled links from our bot:

```
https://jupiter-cash.com?in=<MINT_IN>&out=<MINT_OUT>&amt=0.75&slip=75&feeBps=10
```

**Connect** → **review** → **Swap** → **Earn GASD automatically**

The more you swap, the more GASD you earn, and the higher your cashback tier becomes!

---

## ⚙️ Setup (Operator)

### 🎯 Goal
Serverless calculations via GitHub Actions, manual payouts locally (safer).

### 📁 Files & scripts (already in this repo)

| File/Directory | Description |
|----------------|-------------|
| `index.html` | Single static page that embeds Jupiter Terminal with platformFee enabled |
| `.github/workflows/snapshot.yml` | Captures GASD balances each Monday 12:00 CET |
| `.github/workflows/weekly.yml` | Computes volumes.csv, payout.csv, and gasd_earned.csv each Monday 12:05 CET |
| `scripts/build_volumes.js` | Aggregates weekly estimated volumes from on-chain fee inflows |
| `scripts/snapshot_gasd.js` | Snapshots GASD balances for wallets seen in volumes.csv |
| `scripts/build_payout.js` | Applies tiers (50/60/70/80%) and writes payout.csv, includes burn calculation |
| `scripts/distribute_gasd.js` | Calculates and distributes earned GASD tokens based on swap volume |
| `scripts/pay_usdc_local.js` | Local USDC payout sender (run on your laptop) |

### 🔧 Required configuration

#### Repository → Settings → Actions → Variables
- `GASD_MINT` — SPL mint address of GASD

#### Repository → Settings → Actions → Secrets
- `FEE_USDC_ATA` — your USDC ATA that receives Jupiter integrator fees

#### In index.html
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
| **Direct burn** | 2% of fees automatically burned to reduce supply |

---

## ⚙️ Parameters (change if needed)

| Parameter | Value |
|-----------|-------|
| **feeBps** (integrator fee) | 10 bps (0.10%) |
| **Burn rate** | 200 bps (2.00%) |
| **Platform rate** | 180 bps (1.80%) |
| **User cashback** | Up to 80% of fees |
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
Every Monday 12:00 CET. Your GASD balance at that time determines your cashback tier for the week.

### How do I earn GASD tokens?
GASD tokens are earned automatically with every swap: 1 GASD = $1 USD swap volume. They are distributed weekly along with your cashback.

### What if my payout is tiny?
Very small amounts may be rolled to next week to avoid dust.

### Can tiers change?
Yes, parameters may evolve—but we announce changes at least 1 week in advance and update this README.

### Is there a guarantee of earnings?
No. Cashback depends on actual swap volumes and fees collected. GASD does not guarantee yield; it only adjusts the split.

### Do I need to stake GASD tokens?
No! The new direct burn mechanism requires no staking. Simply hold GASD tokens to benefit from supply reduction.

---

## 📞 Contact

- **Support**: hello@jupiter-cash.com
- **Status / CSVs**: see the data/ folder in this repo (updated weekly)