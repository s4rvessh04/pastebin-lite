# Pastebin-Lite
A lightweight, serverless-optimized "Pastebin" clone built with Next.js 16 and PostgreSQL. Users can create text pastes with optional TTL (time-to-live) and view-count limits.

## 🚀 Features
- Create Pastes: Store arbitrary text content.

- Constraints: Set optional expiration times (TTL) or maximum view limits.

- Deterministic Testing: Support for x-test-now-ms headers to allow for time-controlled automated testing.

- Security: Strict Content Security Policy (CSP) and React auto-escaping to prevent XSS/malware attacks.

- Persistence: Fully persistent storage that works across serverless cold starts.

## 🛠️ Local Setup
Follow these steps to run the project locally:

Clone the repository:


```bash
git clone <your-repo-url>
cd pastebin-lite
```
Install dependencies:
```Bash
pnpm install
```
Configure Environment Variables: Create a .env.local file in the root directory and add your PostgreSQL connection string:

```Bash
DATABASE_URL=postgres://user:password@hostname:port/neondb?sslmode=require
BASE_URL=http://localhost:3000
```

Initialize the Database: Run the following SQL command in your PostgreSQL console to create the necessary table:

```SQL

CREATE TABLE pastes (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    max_views INTEGER,
    view_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

Start the development server:

```Bash
pnpm run dev
```
Open http://localhost:3000 to view the app.


## 🗄️ Persistence Layer
This project uses PostgreSQL (hosted on Neon) as the persistence layer via the pg library.

Why PostgreSQL? Unlike global variables or in-memory caches, PostgreSQL ensures that data remains consistent across serverless function invocations on Vercel. We utilized a Pooled Connection string to handle the high-concurrency demands of serverless environments efficiently.

## 🧠 Notable Decisions
1. Atomic Updates for Concurrency
To satisfy the view-count constraint, the application uses a single atomic SQL UPDATE statement:

```SQL

UPDATE pastes SET view_count = view_count + 1 
WHERE id = $1 AND (view_count < max_views OR max_views IS NULL)
```

This prevents race conditions where multiple simultaneous visitors might bypass the view limit—a common issue with "read-then-write" logic in serverless environments.

2. Next.js 16 Asynchronous APIs
Following the latest Next.js 16 standards, all dynamic APIs such as headers() and params are handled asynchronously. This ensures compatibility with the latest rendering optimizations like Partial Prerendering (PPR).

3. Security & Malware Prevention
To protect users from malicious content:

- XSS Protection: Content is rendered using React’s default JSX escaping.

- Security Headers: Implemented X-Content-Type-Options: nosniff and a strict Content-Security-Policy via next.config.js to prevent the browser from executing any scripts that might be embedded in user-generated text.

4. Deterministic Time Handling
The app implements a utility to check for the x-test-now-ms header. If present, the application uses this "mocked" time for all TTL calculations and database queries, allowing the automated test suite to verify expiration logic reliably.

📡 API Endpoints
- GET /api/healthz: Returns health status and DB connectivity.

- POST /api/pastes: Creates a new paste (JSON).

- GET /api/pastes/:id: Returns paste metadata (JSON) and increments view count.

- GET /p/:id: UI route to view the paste content.
