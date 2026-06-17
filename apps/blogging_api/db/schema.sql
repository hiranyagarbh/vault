CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY
    ,title TEXT NOT NULL
    ,content TEXT NOT NULL
    ,category TEXT NOT NULL
    ,tags JSONB NOT NULL DEFAULT '{}'::jsonb
    ,created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    ,updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- GIN index for efficient JSONB querying

CREATE INDEX idx_blog_posts_attributes ON blog_posts USING GIN (tags);