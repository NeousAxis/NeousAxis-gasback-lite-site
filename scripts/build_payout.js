import fs from "fs";

const OUT_DIR = "data";
const FEE_BPS = parseInt(process.env.FEE_BPS || "10", 10);
const T1 = parseFloat(process.env.TIER_MIN_1 || "100");   // 60%
const T2 = parseFloat(process.env.TIER_MIN_2 || "500");   // 70%
const T3 = parseFloat(process.env.TIER_MIN_3 || "1000");  // 80%

function readCSV(path) {
  if (!fs.existsSync(path)) return [];
  return fs.readFileSync(path, "utf8").trim().split("\n").slice(1)
    .map(l => l.split(","))
    .filter(x => x.length >= 2);
}
function readJSON(path) {
  if (!fs.existsSync(path)) return {};
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const rows = readCSV(`${OUT_DIR}/volumes.csv`);      // wallet,volume_usd
const snap = readJSON(`${OUT_DIR}/snapshot.json`);   // { wallet: { gasd: number } }

function rateFor(gasd) {
  if (gasd >= T3) return 0.8;
  if (gasd >= T2) return 0.7;
  if (gasd >= T1) return 0.6;
  return 0.5;
}

const out = [["wallet", "amount_usdc", "rate", "gasd", "volume_usd"]];
for (const [wallet, volStr] of rows) {
  const volume = parseFloat(volStr || "0");
  const gasd = snap[wallet]?.gasd || 0;
  const rate = rateFor(gasd);
  const feeFraction = FEE_BPS / 10000;       // ex 0.001
  const amount = volume * feeFraction * rate; // montant USDC à payer
  out.push([wallet, amount.toFixed(6), rate.toFixed(2), gasd.toFixed(6), volume.toFixed(6)]);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(`${OUT_DIR}/payout.csv`, out.map(r => r.join(",")).join("\n"));
console.log(`Wrote ${OUT_DIR}/payout.csv with ${out.length - 1} rows`);
