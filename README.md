0) TL;DR

Integrator fee: feeBps = 10 (0.10%) on swaps routed via Jupiter.

Cashback tiers (progressive, anti-dust)

GASD balance at snapshot	Cashback rate on fees
< 100 GASD	50%
≥ 100 GASD	60%
≥ 500 GASD	70%
≥ 1 000 GASD	80%

Payout: weekly in USDC to the same wallet used for swaps.

Snapshot: Monday 12:00 CET (Europe/Zurich).


1) How It Works (User)

Open the GasBack Lite swap page (Jupiter widget embedded).

Connect your wallet (Phantom, Backpack, …) and swap as usual.

Each Monday we compute your cashback from the fees your swaps generated.

You receive USDC weekly. Hold GASD before the snapshot to unlock higher tiers.

Nothing changes in your trading flow—just weekly rebates.


2) Transparency

We publish two files each week in the repo:

data/volumes.csv — estimated weekly swap volume per wallet.

data/payout.csv — USDC amounts to be paid per wallet + applied tier.

Fee inflows land on our public USDC fee account(s) on Solana.

No personal data—only wallet addresses.


3) What Counts Toward Cashback

Included: swaps performed through the GasBack Lite page (with integrator fee enabled).

Excluded: failed/canceled swaps; swaps routed elsewhere; dust-size payouts (we may roll over tiny amounts to the next week).

Cashback formula (per wallet i)

Estimated volume_i  ≈  Σ( fee_usdc_tx × 10000 / feeBps )
Cashback_i          =  Estimated volume_i × (feeBps / 10000) × tier_i


Where tier_i ∈ {0.50, 0.60, 0.70, 0.80} from the table above.

Example: With feeBps = 10 (0.10%) and $100,000 weekly volume:

Fees = $100 → Standard (50%) pays $50, Premium-max (80%) pays $80.


4) Quick Start (User)

Visit: https://<your-domain>/swap.html

(Optional) Use prefilled links from our bot:

https://<your-domain>/swap.html?in=<MINT_IN>&out=<MINT_OUT>&amt=0.75&slip=75&feeBps=10


Connect → review → Swap.

Hold GASD before Monday 12:00 CET to reach better tiers.


5) Setup (Operator)

Goal: serverless calculations via GitHub Actions, manual payouts locally (safer).

5.1 Files & scripts (already in this repo)

swap.html — single static page that embeds Jupiter Terminal with platformFee enabled.

.github/workflows/snapshot.yml — captures GASD balances each Monday 12:00 CET.

.github/workflows/weekly.yml — computes volumes.csv and payout.csv each Monday 12:05 CET.

scripts/build_volumes.js — aggregates weekly estimated volumes from on-chain fee inflows.

scripts/snapshot_gasd.js — snapshots GASD balances for wallets seen in volumes.csv.

scripts/build_payout.js — applies tiers (50/60/70/80%) and writes payout.csv.

scripts/pay_usdc_local.js — local USDC payout sender (run on your laptop).

5.2 Required configuration

Repository → Settings → Actions → Variables

GASD_MINT — SPL mint address of GASD.

Repository → Settings → Actions → Secrets

FEE_USDC_ATA — your USDC ATA that receives Jupiter integrator fees.

In swap.html, set platformFeeAndAccounts.feeBps = 10 and add fee accounts as needed (start with USDC only).

5.3 Cron calendar (defaults)

Snapshot: Monday 12:00 CET (Europe/Zurich)

Weekly aggregation: Monday 12:05 CET

You can trigger either workflow manually from the Actions tab.


6) Payout (Operator)

We recommend manual local payout for security:

Pull the repo to your machine (contains data/payout.csv).

Export your private key locally (never commit/secrets in cloud).

Run:

export PAYER_PRIVATE_KEY=<base58_secret_key_local_only>
node scripts/pay_usdc_local.js CSV_PATH=data/payout.csv WEEKLY_CAP_USDC=2000


All txids are visible on-chain. You can append them to a log for audit.


7) Security Notes

No custody: swaps route via Jupiter; users sign in their own wallets.

No hot wallet in CI: payouts run locally.

Tier anti-dust: < 100 GASD stays at 50% (prevents “dust” gaming).

Rate caps: maximum cashback rate is 80% (never more).

Roll-over: we may roll tiny payouts to the next week to avoid dust.


8) Parameters (change if needed)

feeBps (integrator fee): 10 bps (0.10%)

Tiers: <100:50%, ≥100:60%, ≥500:70%, ≥1000:80%

Snapshot: Monday 12:00 CET

Payout asset: USDC (Solana)

Initial pairs: SOL ↔ USDC (expand later)


9) White-Label (Optional)

Communities/influencers can get:

a branded URL (separate fee accounts),

a public GMV/fees dashboard,

a rev-share from our margin (users keep their 50/60/70/80% rates).


10) FAQ

Do I need an account?
No. Connect wallet, swap, and receive weekly USDC.

When is the snapshot taken?
Every Monday 12:00 CET. Hold GASD before that time to qualify for higher tiers.

What if my payout is tiny?
Very small amounts may be rolled to next week to avoid dust.

Can tiers change?
Yes, parameters may evolve—but we announce changes at least 1 week in advance and update this README.

Is there a guarantee of earnings?
No. Cashback depends on actual swap volumes and fees collected. GASD does not guarantee yield; it only adjusts the split.


Contact

Support: hello@whtg1.com

Status / CSVs: see the data/ folder in this repo (updated weekly).
