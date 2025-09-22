import fs from "fs";

const OUT_DIR = "data";

function readCSV(path) {
  if (!fs.existsSync(path)) return [];
  return fs.readFileSync(path, "utf8").trim().split("\n").slice(1)
    .map(l => l.split(","))
    .filter(x => x.length >= 2);
}

// Lire les volumes de swap de la semaine
const rows = readCSV(`${OUT_DIR}/volumes.csv`);      // wallet,volume_usd

console.log(`Processing GASD distribution for ${rows.length} wallets...`);

// Calculer les GASD à distribuer : 1 GASD = 1 USD de volume
const out = [["wallet", "gasd_earned", "volume_usd"]];
let totalGASDToDistribute = 0;

for (const [wallet, volStr] of rows) {
  const volume = parseFloat(volStr || "0");
  const gasdEarned = volume; // 1 GASD = 1 USD volume
  
  if (gasdEarned > 0) {
    out.push([wallet, gasdEarned.toFixed(6), volume.toFixed(6)]);
    totalGASDToDistribute += gasdEarned;
  }
}

// Créer le dossier data s'il n'existe pas
fs.mkdirSync(OUT_DIR, { recursive: true });

// Écrire le fichier CSV des GASD gagnés
fs.writeFileSync(`${OUT_DIR}/gasd_earned.csv`, out.map(r => r.join(",")).join("\n"));

console.log(`✅ Wrote ${OUT_DIR}/gasd_earned.csv with ${out.length - 1} rows`);
console.log(`📊 Total GASD to distribute: ${totalGASDToDistribute.toFixed(6)}`);

// Créer un résumé JSON pour les autres scripts
const summary = {
  totalWallets: out.length - 1,
  totalGASDToDistribute: totalGASDToDistribute,
  distributionDate: new Date().toISOString(),
  rate: "1 GASD = 1 USD swap volume"
};

fs.writeFileSync(`${OUT_DIR}/gasd_distribution_summary.json`, JSON.stringify(summary, null, 2));
console.log(`📋 Summary written to ${OUT_DIR}/gasd_distribution_summary.json`);