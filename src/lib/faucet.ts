import { ethers } from 'ethers';

const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY || '';
const FAUCET_AMOUNT = process.env.FAUCET_AMOUNT || '10';

let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;

function getProvider(): ethers.JsonRpcProvider {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(RPC_URL);
  }
  return provider;
}

function getWallet(): ethers.Wallet {
  if (!wallet) {
    if (!FAUCET_PRIVATE_KEY) {
      throw new Error('FAUCET_PRIVATE_KEY not configured');
    }
    const key = FAUCET_PRIVATE_KEY.startsWith('0x')
      ? FAUCET_PRIVATE_KEY
      : `0x${FAUCET_PRIVATE_KEY}`;
    wallet = new ethers.Wallet(key, getProvider());
  }
  return wallet;
}

export async function getFaucetAddress(): Promise<string> {
  return getWallet().address;
}

export async function getFaucetBalance(): Promise<string> {
  const balance = await getProvider().getBalance(getWallet().address);
  return ethers.formatEther(balance);
}

export async function sendFaucetTokens(toAddress: string): Promise<string> {
  const wallet = getWallet();
  const amount = ethers.parseEther(FAUCET_AMOUNT);

  const tx = await wallet.sendTransaction({
    to: toAddress,
    value: amount,
  });

  return tx.hash;
}

export function getFaucetAmount(): string {
  return FAUCET_AMOUNT;
}

export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}
