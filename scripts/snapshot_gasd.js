import fs from "fs";
import { Connection, PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, getAccount, TOKEN_PROGRAM_ID } from "@solana/spl-token";

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const GASD_MINT = process.env.GASD_MINT; // mint de ton token
if (!GASD_MINT) throw new Error("Missing GASD_MINT");

const OUT_DIR = "data";
fs.mkdirSync(OUT_DIR, { recursive: true });

const conn = new Connection(RPC_URL, "confirmed");
const mint = new PublicKey(GASD_MINT);

function loadVolumesWallets() {
  const path = `${OUT_DIR}/volumes.csv`;
  if (!fs.existsSync(path)) return [];
  const rows = fs.readFileSync(path, "utf8").trim().split("\n").slice(1);
  return rows.map(r => r.split(",")[0]).filter(Boolean);
}

(async () => {
  const wallets = Array.from(new Set(loadVolumesWallets()));
  const snapshot = {};
  for (const w of wallets) {
    try {
      const owner = new PublicKey(w);
      const ata = await getAssociatedTokenAddress(mint, owner);
      let bal = 0;
      try {
        const acc = await getAccount(conn, ata);
        bal = Number(acc.amount) / 1e9; // suppose 9 décimales GASD
      } catch {
        bal = 0; // ATA inexistant => 0
      }
      snapshot[w] = { ata: ata.toBase58(), gasd: bal };
    } catch {
      snapshot[w] = { ata: null, gasd: 0 };
    }
  }
  fs.writeFileSync(`${OUT_DIR}/snapshot.json`, JSON.stringify(snapshot, null, 2));
  console.log(`Wrote ${OUT_DIR}/snapshot.json for ${wallets.length} wallets`);
})();
