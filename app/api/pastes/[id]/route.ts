import { pool } from "@/lib/db";
import { getCurrentTime } from "@/lib/now";
import { NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  context: RouteContext
) {
  const now = await getCurrentTime();
  const { id } = await context.params;

  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      UPDATE pastes
      SET view_count = view_count + 1
      WHERE id = $1
      AND (expires_at IS NULL OR expires_at > $2)
      AND (max_views IS NULL OR view_count < max_views)
      RETURNING content, max_views, view_count, expires_at
      `,
      [id, now]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Not found or expired" }, { status: 404 });
    }

    const row = result.rows[0];

    return NextResponse.json({
      content: row.content,
      remaining_views:
        row.max_views === null
          ? null
          : Math.max(row.max_views - row.view_count, 0),
      expires_at: row.expires_at,
    });

  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  } finally {
    client.release();
  }
}
