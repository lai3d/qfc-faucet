import { NextRequest, NextResponse } from 'next/server';
import {
  sendFaucetTokens,
  getFaucetBalance,
  getFaucetAddress,
  getFaucetAmount,
  isValidAddress,
} from '@/lib/faucet';
import {
  canRequest,
  recordRequest,
  getRecentRequests,
  getCooldownHours,
} from '@/lib/rateLimit';

// GET /api/faucet - Get faucet info
export async function GET() {
  try {
    const [address, balance] = await Promise.all([
      getFaucetAddress(),
      getFaucetBalance(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        address,
        balance,
        amount: getFaucetAmount(),
        cooldownHours: getCooldownHours(),
        recentRequests: getRecentRequests(),
      },
    });
  } catch (error) {
    console.error('Faucet GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get faucet info',
      },
      { status: 500 }
    );
  }
}

// POST /api/faucet - Request tokens
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    // Validate address
    if (!address || typeof address !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    if (!isValidAddress(address)) {
      return NextResponse.json(
        { success: false, error: 'Invalid address format' },
        { status: 400 }
      );
    }

    // Check rate limit
    const rateCheck = canRequest(address);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limited. Please wait ${rateCheck.remainingTime} hour(s) before requesting again.`,
        },
        { status: 429 }
      );
    }

    // Get client IP for logging
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Send tokens
    const txHash = await sendFaucetTokens(address);

    // Record the request
    recordRequest(address, ip);

    return NextResponse.json({
      success: true,
      data: {
        txHash,
        amount: getFaucetAmount(),
        address,
      },
    });
  } catch (error) {
    console.error('Faucet POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send tokens',
      },
      { status: 500 }
    );
  }
}
