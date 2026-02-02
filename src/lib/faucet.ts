import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const FAUCET_AMOUNT = process.env.FAUCET_AMOUNT || '10';

let provider: ethers.JsonRpcProvider | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

// Faucet address is the Ed25519 address derived from key [0x42; 32]
const FAUCET_ADDRESS = '0x10d7812fbe50096ae82569fdad35f79628bc0084';

export async function getFaucetAddress(): Promise<string> {
  return FAUCET_ADDRESS;
}

export async function getFaucetBalance(): Promise<string> {
  const balance = await getProvider().getBalance(FAUCET_ADDRESS);
  return ethers.formatEther(balance);
}

interface FaucetResponse {
  txHash: string;
  amount: string;
  to: string;
}

export async function sendFaucetTokens(toAddress: string): Promise<string> {
  // Use qfc_requestFaucet RPC method which handles Ed25519 signing server-side
  const amount = ethers.parseEther(FAUCET_AMOUNT);

  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'qfc_requestFaucet',
      params: [toAddress, `0x${amount.toString(16)}`],
      id: 1,
    }),
  });

  const result = await response.json();

  if (result.error) {
    throw new Error(result.error.message || 'Faucet request failed');
  }

  const data = result.result as FaucetResponse;
  return data.txHash;
}

export function getFaucetAmount(): string {
  return FAUCET_AMOUNT;
}

export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}
