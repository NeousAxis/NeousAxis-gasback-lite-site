import fs from "fs";

const OUT_DIR = "data";
const FEE_BPS = parseInt(process.env.FEE_BPS || "10", 10);
const BURN_BPS = 200; // 2% des frais pour le burn direct (200 bps)
const PLATFORM_BPS = FEE_BPS - BURN_BPS; // 18% pour la plateforme (80% pour l'utilisateur)
const T1 = parseFloat(process.env.TIER_MIN_1 || "300");   // 60%
const T2 = parseFloat(process.env.TIER_MIN_2 || "1000");  // 70%
const T3 = parseFloat(process.env.TIER_MIN_3 || "10000"); // 80%

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
let totalFees = 0;
let totalBurn = 0;
let totalPlatform = 0;

for (const [wallet, volStr] of rows) {
  const volume = parseFloat(volStr || "0");
  const gasd = snap[wallet]?.gasd || 0;
  const rate = rateFor(gasd);
  
  // Calcul des frais totaux
  const feeFraction = FEE_BPS / 10000;       // ex 0.001
  const totalFee = volume * feeFraction;
  
  // Calcul du burn direct (2% des frais)
  const burnFraction = BURN_BPS / 10000;     // 0.0002
  const burnAmount = volume * burnFraction;
  
  // Calcul du montant pour la plateforme (18% des frais)
  const platformFraction = PLATFORM_BPS / 10000; // 0.00018
  const platformAmount = volume * platformFraction;
  
  // Calcul du montant pour l'utilisateur (80% des frais)
  const amount = totalFee * rate;
  
  // Mise à jour des totaux
  totalFees += totalFee;
  totalBurn += burnAmount;
  totalPlatform += platformAmount;
  
  out.push([wallet, amount.toFixed(6), rate.toFixed(2), gasd.toFixed(6), volume.toFixed(6)]);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(`${OUT_DIR}/payout.csv`, out.map(r => r.join(",")).join("\n"));
console.log(`Wrote ${OUT_DIR}/payout.csv with ${out.length - 1} rows`);

// Création d'un fichier de résumé des frais
const feeSummary = {
  totalFees: totalFees.toFixed(6),
  totalBurn: totalBurn.toFixed(6),
  totalPlatform: totalPlatform.toFixed(6),
  userCashbackRate: "80% maximum",
  burnRate: "2% des frais",
  platformRate: "18% des frais"
};

fs.writeFileSync(`${OUT_DIR}/fee_summary.json`, JSON.stringify(feeSummary, null, 2));
console.log(`Wrote ${OUT_DIR}/fee_summary.json with fee distribution summary`);