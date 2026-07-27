import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { getAuthUser } from '@/lib/api-helpers';

export async function GET(request: Request) {
  try {
    const user = await getAuthUser(request);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getAuthUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const store = await getStore();
    const { displayName, bio, city, province, country, email, avatarUrl } = await request.json();
    const current = store.users[currentUser.id];

    if (!current) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const updated = { ...current };
    if (displayName !== undefined) updated.displayName = displayName;
    if (bio !== undefined) updated.bio = bio;
    if (city !== undefined) updated.city = city;
    if (province !== undefined) updated.province = province;
    if (country !== undefined) updated.country = country;
    if (email !== undefined) updated.email = email;
    if (avatarUrl !== undefined) updated.avatarUrl = avatarUrl;

    store.users[updated.id] = updated;
    store.user = { ...updated };

    const myRankIdx = store.leaderboard.findIndex((e) => e.id === updated.id);
    if (myRankIdx !== -1) {
      store.leaderboard[myRankIdx].displayName = updated.displayName;
      if (city) store.leaderboard[myRankIdx].city = city;
      if (country) store.leaderboard[myRankIdx].country = country;
    }

    store.persist();
    return NextResponse.json({ user: { ...store.user, passwordHash: undefined } });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
