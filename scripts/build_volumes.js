import fs from "fs";
import { Connection, PublicKey } from "@solana/web3.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

const RPC_URL = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const FEE_BPS = parseInt(process.env.FEE_BPS || "10", 10);
const FEE_USDC_ATA = process.env.FEE_USDC_ATA; // ton ATA USDC collecteur
if (!FEE_USDC_ATA) throw new Error("Missing FEE_USDC_ATA");

const OUT_DIR = "data";
fs.mkdirSync(OUT_DIR, { recursive: true });

const conn = new Connection(RPC_URL, "confirmed");
const feeAta = new PublicKey(FEE_USDC_ATA);

// Fenêtre hebdo: du lundi précédent 12:00 UTC au lundi courant 12:00
function weekWindowNow() {
  const now = dayjs();
  const monday = now.startOf("week").add(1, "day"); // Monday 00:00
  const start = monday.add(12, "hour").subtract(7, "day"); // last Mon 12:00
  const end = monday.add(12, "hour"); // this Mon 12:00
  return { startTs: start.unix(), endTs: end.unix() };
}

const { startTs, endTs } = weekWindowNow();

function short(k) { return k.slice(0, 4) + "…" + k.slice(-4); }

(async () => {
  console.log(`Weekly window: ${startTs} -> ${endTs}`);
  // Récupère signatures pour l'adresse ATA (desc)
  let sigs = [];
  let before = undefined;
  while (true) {
    const page = await conn.getSignaturesForAddress(feeAta, { before, limit: 1000 });
    if (page.length === 0) break;
    for (const s of page) {
      if (!s.blockTime) continue;
      if (s.blockTime < startTs) { page.length = 0; break; } // on peut break total
      if (s.blockTime <= endTs && s.blockTime >= startTs) sigs.push(s);
    }
    before = page[page.length - 1]?.signature;
    if (!before) break;
    // Si la dernière tx de la page est déjà < startTs, on arrête
    if (page[page.length - 1]?.blockTime && page[page.length - 1].blockTime < startTs) break;
  }
  console.log(`Found ${sigs.length} tx in window`);

  const volumes = new Map(); // wallet -> volume_usd (estimation)
  for (const s of sigs) {
    const tx = await conn.getTransaction(s.signature, {
      maxSupportedTransactionVersion: 0,
      commitment: "confirmed",
    });
    if (!tx || tx.meta?.err) continue;

    // calcule fee USDC reçu (delta post-pre sur l'ATA)
    const pre = (tx.meta?.preTokenBalances || []).find(b => b.owner === FEE_USDC_ATA);
    const post = (tx.meta?.postTokenBalances || []).find(b => b.owner === FEE_USDC_ATA);
    const preAmt = pre?.uiTokenAmount?.uiAmount || 0;
    const postAmt = post?.uiTokenAmount?.uiAmount || 0;
    const feeUsdc = postAmt - preAmt;
    if (feeUsdc <= 0) continue;

    // volume estimé ≈ fee * 10000 / bps
    const volume = feeUsdc * (10000 / FEE_BPS);

    // Attribue au signataire principal de la tx (simple & robuste)
    const signer = tx.transaction.message.accountKeys.find(k => k.signer)?.pubkey?.toBase58?.();
    if (!signer) continue;

    volumes.set(signer, (volumes.get(signer) || 0) + volume);
  }

  // Écrit volumes.csv
  const lines = [["wallet", "volume_usd"]];
  for (const [w, v] of volumes.entries()) lines.push([w, v.toFixed(6)]);
  fs.writeFileSync(`${OUT_DIR}/volumes.csv`, lines.map(r => r.join(",")).join("\n"));
  console.log(`Wrote ${OUT_DIR}/volumes.csv with ${volumes.size} wallets`);
})();