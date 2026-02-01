import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QFC Testnet Faucet',
  description: 'Get free QFC tokens for testing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-qfc-50 to-blue-50">
        {children}
      </body>
    </html>
  );
}
