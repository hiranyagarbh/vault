# Blogging Platform API

Build a RESTful API for a personal blogging platform backed by PostgreSQL.

## Overview

This project is a fully functional CRUD API for managing blog posts. It accepts JSON over HTTP, persists data in a PostgreSQL database, and returns structured responses with appropriate status codes. There is no authentication, pagination, or frontend — just a clean backend API you can drive with `curl` or a REST client.

This project will help you understand how to:

- Design and query a relational database with PostgreSQL
- Structure a RESTful API with Express.js following separation of concerns
- Store and query semi-structured data using PostgreSQL's `JSONB` type
- Perform full-text wildcard searches across multiple columns and JSON fields
- Handle errors centrally using Express middleware
- Write integration and unit tests for a database-backed API

## Data Model

Each blog post is stored in a single `blog_posts` table. Tags are stored inside a `JSONB` column (`attributes`) rather than a separate table, which keeps the schema simple while still allowing fast indexed searches.

### Schema

```sql
CREATE TABLE blog_posts (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  category    TEXT NOT NULL,
  attributes  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes the entire JSON structure to allow fast searching inside JSONB arrays
CREATE INDEX idx_blog_posts_attributes ON blog_posts USING gin (attributes);
```

The `attributes` column holds the `tags` array:

```json
{ "tags": ["Tech", "Programming"] }
```

## API Endpoints

### `POST /api/posts` — Create a blog post

**Request body:**

```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post.",
  "category": "Technology",
  "tags": ["Tech", "Programming"]
}
```

All four fields are required. Returns `201 Created` with the new post, or `400 Bad Request` if any required field is missing.

**Success Response (201):**

```json
{
  "id": 1,
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post.",
  "category": "Technology",
  "tags": ["Tech", "Programming"],
  "createdAt": "2021-09-01T12:00:00Z",
  "updatedAt": "2021-09-01T12:00:00Z"
}
```

---

### `GET /api/posts` — Get all blog posts

Returns all posts. Optionally filter by a search term across `title`, `content`, `category`, and `tags`.

**Query Parameters:**

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| `term`    | string | No       | Wildcard search across title, content, category, and tags |

```
GET /api/posts
GET /api/posts?term=tech
```

**Success Response (200):** An array of post objects (same shape as above). Empty array `[]` if no results.

---

### `GET /api/posts/:id` — Get a single blog post

Returns the post with the given `id`.

| Status | Reason                  |
|--------|-------------------------|
| 200    | Post found              |
| 404    | Post not found          |

---

### `PUT /api/posts/:id` — Update a blog post

Replaces all fields of an existing post. All four fields (`title`, `content`, `category`, `tags`) are required.

| Status | Reason                              |
|--------|-------------------------------------|
| 200    | Post updated, returns updated post  |
| 400    | Missing required field(s)           |
| 404    | Post not found                      |

---

### `DELETE /api/posts/:id` — Delete a blog post

| Status | Reason                  |
|--------|-------------------------|
| 204    | Post deleted            |
| 404    | Post not found          |

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/blogging_api
```

| Variable       | Description                         | Default |
|----------------|-------------------------------------|---------|
| `PORT`         | Port the server listens on          | `3000`  |
| `DATABASE_URL` | Full PostgreSQL connection string   | —       |

For tests, also create a `.env.test` file pointing at a separate test database so your test suite never touches production data:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:password@localhost:5432/blogging_api_test
```

## Project Structure

```
blogging_api/
├── server.js                   # Entry point — starts the HTTP server
├── app.js                      # Express app setup (routes, middleware wired together)
├── routes/
│   └── posts.js                # Route definitions for /api/posts
├── controllers/
│   └── postController.js       # Request parsing, response sending, input validation
├── services/
│   └── postService.js          # Business logic and all SQL queries
├── db/
│   ├── index.js                # pg Pool instance (shared across the app)
│   └── schema.sql              # Table and index definitions — run once to set up
├── middleware/
│   └── errorHandler.js         # Centralized Express error handling middleware
├── tests/
│   ├── postService.test.js     # Unit tests for postService (mocked DB)
│   └── postRoutes.test.js      # Integration tests for the HTTP routes
├── .env                        # Environment variables (not committed)
├── .env.test                   # Test environment variables (not committed)
├── .env.example                # Template for .env
├── package.json
└── README.md
```