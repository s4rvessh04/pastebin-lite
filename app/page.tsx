'use client';

import { useState } from 'react';

export default function Home() {
  const [content, setContent] = useState('');
  const [ttl, setTtl] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [result, setResult] = useState<{ url: string; id: string } | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/pastes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          ttl_seconds: ttl ? parseInt(ttl) : undefined,
          max_views: maxViews ? parseInt(maxViews) : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create paste');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Pastebin-Lite</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Content (Required)</label>
          <textarea
            required
            className="w-full h-40 p-2 border rounded shadow-sm text-white"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your text here..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">TTL (Seconds)</label>
            <input
              type="number"
              min="1"
              className="w-full p-2 border rounded text-white"
              value={ttl}
              onChange={(e) => setTtl(e.target.value)}
              placeholder="e.g. 3600"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Max Views</label>
            <input
              type="number"
              min="1"
              className="w-full p-2 border rounded text-white"
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          Create Paste
        </button>
      </form>

      {/* Show error messages clearly [cite: 119] */}
      {error && (
        <div className="mt-6 p-4 bg-red-100 text-red-700 rounded border border-red-200">
          {error}
        </div>
      )}

      {/* Receive and display the shareable URL  */}
      {result && (
        <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded">
          <p className="font-bold text-green-800">Paste Created!</p>
          <p className="mt-1">Shareable URL:</p>
          <a
            href={result.url}
            className="text-blue-600 underline break-all"
            target="_blank"
          >
            {result.url}
          </a>
        </div>
      )}
    </main>
  );
}
