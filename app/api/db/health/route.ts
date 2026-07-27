import { NextResponse } from 'next/server';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';

export async function GET() {
  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: false, message: 'Database not configured' }, { status: 500 });
    }
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, message: 'Supabase database connection is healthy.' });
  } catch (error) {
    console.error('Database health check error:', error);
    return NextResponse.json({ ok: false, error: 'Database connection failed.' }, { status: 500 });
  }
}
