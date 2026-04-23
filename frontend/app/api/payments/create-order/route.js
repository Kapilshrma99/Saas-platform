import { NextResponse } from 'next/server';

const backendApiOrigin = process.env.INTERNAL_API_URL || 'http://localhost:5000';

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, receipt } = body;

    const response = await fetch(`${backendApiOrigin}/api/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt })
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Create payment order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
