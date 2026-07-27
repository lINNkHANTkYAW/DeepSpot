import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ ok: false, error: 'Supabase test route removed in Next.js migration.' }, { status: 501 });
}
