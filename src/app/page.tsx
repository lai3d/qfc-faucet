'use client';

import { useState, useEffect } from 'react';

interface FaucetInfo {
  address: string;
  balance: string;
  amount: string;
  cooldownHours: number;
  recentRequests: { address: string; timestamp: number }[];
}

export default function FaucetPage() {
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    txHash?: string;
  } | null>(null);
  const [faucetInfo, setFaucetInfo] = useState<FaucetInfo | null>(null);

  useEffect(() => {
    fetchFaucetInfo();
  }, []);

  const fetchFaucetInfo = async () => {
    try {
      const res = await fetch('/api/faucet');
      const data = await res.json();
      if (data.success) {
        setFaucetInfo(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch faucet info:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (data.success) {
        setResult({
          success: true,
          message: `Sent ${data.data.amount} QFC to ${data.data.address}`,
          txHash: data.data.txHash,
        });
        setAddress('');
        fetchFaucetInfo();
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to request tokens',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Request failed',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Convert wei to QFC (divide by 10^18)
  const formatQFC = (weiAmount: string) => {
    const wei = BigInt(weiAmount);
    const qfc = Number(wei / BigInt(10 ** 18));
    return qfc.toLocaleString();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-qfc-500 to-blue-500 mb-4">
            <span className="text-3xl">💧</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">QFC Testnet Faucet</h1>
          <p className="text-gray-500 mt-2">
            Get free QFC tokens for testing on the testnet
          </p>
        </div>

        {/* Faucet Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Info Section */}
          {faucetInfo && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Faucet Balance</span>
                  <div className="font-semibold text-lg">
                    {parseFloat(faucetInfo.balance).toLocaleString()} QFC
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Per Request</span>
                  <div className="font-semibold text-lg">
                    {formatQFC(faucetInfo.amount)} QFC
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Cooldown: {faucetInfo.cooldownHours} hours between requests
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your Wallet Address
              </label>
              <input
                type="text"
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-qfc-500 focus:border-transparent outline-none"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !address}
              className="w-full py-3 bg-gradient-to-r from-qfc-500 to-blue-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Sending...
                </span>
              ) : (
                'Request Tokens'
              )}
            </button>
          </form>

          {/* Result */}
          {result && (
            <div
              className={`mt-4 p-4 rounded-xl ${
                result.success
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              <div className="font-medium">
                {result.success ? '✓ Success!' : '✗ Error'}
              </div>
              <div className="text-sm mt-1">{result.message}</div>
              {result.txHash && (
                <div className="mt-2 text-xs font-mono break-all">
                  TX: {result.txHash}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Requests */}
        {faucetInfo && faucetInfo.recentRequests.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
            <h2 className="font-semibold text-gray-800 mb-3">Recent Requests</h2>
            <div className="space-y-2">
              {faucetInfo.recentRequests.map((req, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded-lg"
                >
                  <span className="font-mono text-gray-600">
                    {formatAddress(req.address)}
                  </span>
                  <span className="text-gray-400">{formatTime(req.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Network Info */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Network: QFC Testnet (Chain ID: 9000)</p>
          <p className="mt-1">
            RPC:{' '}
            <code className="bg-gray-100 px-2 py-0.5 rounded">
              http://127.0.0.1:8545
            </code>
          </p>
        </div>
      </div>
    </div>
  );
}
