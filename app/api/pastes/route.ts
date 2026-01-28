import { pool } from '@/lib/db';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { content, ttl_seconds, max_views } = await req.json();

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  }

  const id = nanoid(10);
  const expiresAt = ttl_seconds ? new Date(Date.now() + ttl_seconds * 1000) : null;
  // const expiresAt = ttl_seconds ? new Date(Date.now() + ttl_seconds * 1000).toISOString() : null;

  await pool.query(
    'INSERT INTO pastes (id, content, max_views, expires_at) VALUES ($1, $2, $3, $4)',
    [id, content, max_views || null, expiresAt]
  );

  return NextResponse.json({
    id,
    url: `${process.env.BASE_URL}/p/${id}`
  });
}
