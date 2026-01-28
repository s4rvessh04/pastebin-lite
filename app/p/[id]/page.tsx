import { pool } from '@/lib/db';
import { notFound } from 'next/navigation';
import { getCurrentTime } from '@/lib/now';
import DOMPurify from "isomorphic-dompurify";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ViewPaste({ params }: PageProps) {
  const { id } = await params;
  const now = await getCurrentTime();

  // ATOMIC UPDATE: Increment view_count AND check constraints in one go
  const result = await pool.query(
    `UPDATE pastes 
     SET view_count = view_count + 1 
     WHERE id = $1 
     AND (expires_at IS NULL OR expires_at > $2)
     AND (max_views IS NULL OR view_count < max_views)
     RETURNING content`,
    [id, now]
  );

  // If the paste was expired, reached max views, or doesn't exist, 
  // the UPDATE will affect 0 rows.
  if (result.rowCount === 0) {
    notFound();
  }

  // const clean = DOMPurify.sanitize(result.rows[0].content);
  const clean = result.rows[0].content;

  return (
    <main className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-bold mb-4">View Paste</h1>
        <pre className="whitespace-pre-wrap break-words bg-gray-100 p-6 rounded border text-black shadow-sm">
          {clean}
        </pre>
      </div>
    </main>
  );
}
