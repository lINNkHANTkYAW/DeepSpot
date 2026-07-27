import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { generateForensicHint } from '@/lib/gemini';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const store = await getStore();
    const { id } = await params;
    const post = store.posts.find((p) => p.id === id);
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 });

    const fallback =
      post.revealHint ||
      'Look for ear contour blending, unnatural pupil specular reflections, and mismatched lighting angles along clothing seams.';

    const hintText = await generateForensicHint(
      `You are DeepSpot AI Forensic Investigator. Examine this post: "${post.caption || 'Media Challenge'}", tags: [${post.tags.join(', ')}]. Truth label: ${post.trueLabel || post.fakeSlot}. Provide a crisp 2-sentence expert breakdown on specific visual tells (e.g. eye blink cadence, lighting physics, dermal pore pattern).`,
      fallback
    );

    post.revealHint = hintText;
    store.persist();
    return NextResponse.json({ hint: hintText });
  } catch (error) {
    console.error('AI hint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
