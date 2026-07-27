import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { prisma, isDatabaseConfigured } from '@/lib/prisma';
import type { Report } from '@/types';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const store = await getStore();
    const { id } = await params;
    const { reason, note } = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Please log in to report a challenge.' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    const { verifyToken } = await import('@/lib/auth');
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 401 });
    }

    const currentUser = store.users[payload.userId];
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 401 });
    }

    const post = store.posts.find((p) => p.id === id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const newReport: Report = {
      id: `rep_${Date.now()}`,
      reporterId: currentUser.id,
      reporterUsername: currentUser.username,
      postId: id,
      postCaption: post.caption,
      reason: reason || 'OTHER',
      note,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
    };

    if (isDatabaseConfigured()) {
      try {
        await prisma.report.create({
          data: {
            id: newReport.id,
            reporterId: newReport.reporterId,
            postId: newReport.postId,
            reason: newReport.reason,
            note: newReport.note,
            status: newReport.status,
            createdAt: new Date(newReport.createdAt),
          },
        });
      } catch (error) {
        console.error('Failed to save the report to the database.', error);
      }
    }

    store.reports.push(newReport);
    store.persist();
    return NextResponse.json({
      message: 'Report submitted successfully. Thank you for keeping DeepSpot safe!',
      report: newReport,
    });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
