import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getMint } from '@solana/spl-token';
import fs from 'fs';

// Connection to Solana network
const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

// Load wallet from file
const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync('/Users/cyrilleger/.config/solana/id.json')));
const wallet = Keypair.fromSecretKey(secretKey);

async function createGASDToken() {
    try {
        console.log('Creating GASD token...');
        
        // Create mint account for GASD token with 9 decimals
        const mint = await createMint(
            connection,
            wallet,
            wallet.publicKey, // mint authority
            wallet.publicKey, // freeze authority
            9 // decimals
        );
        
        console.log('GASD token created successfully!');
        console.log('Mint address:', mint.toBase58());
        
        // Save mint address to file for future use
        fs.writeFileSync('GASD_MINT.txt', mint.toBase58());
        console.log('Mint address saved to GASD_MINT.txt');
        
        // Verify the mint was created
        const mintInfo = await getMint(connection, mint);
        console.log('Mint info:', mintInfo);
        
    } catch (error) {
        console.error('Error creating GASD token:', error);
    }
}

createGASDToken();