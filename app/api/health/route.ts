import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';

export async function GET() {
  try {
    const store = await getStore();
    return NextResponse.json({ status: 'ok', appName: 'DeepSpot', version: '1.0.0' });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({ status: 'error', error: 'Server initialization failed' }, { status: 500 });
  }
}
