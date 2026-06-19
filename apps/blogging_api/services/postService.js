import pool from '../db/index.js';

export async function createPost(data) {
  const { title, content, category, tags } = data;
  const query = `
      INSERT INTO blog_posts (title, content, category, tags)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
  const result = await pool.query(query, [title, content, category, JSON.stringify(tags)]);
  return result.rows[0];
}

export async function getAllPosts() {
  const query = 'SELECT * FROM blog_posts ORDER BY created_at DESC';
  const result = await pool.query(query);
  return result.rows;
}

export async function searchPosts(term) {
  const query = `
      SELECT * FROM blog_posts 
      WHERE 
        title ILIKE $1 OR 
        content ILIKE $1 OR
        category ILIKE $1 OR
        tags::text ILIKE $1
      ORDER BY created_at DESC
    `;
  const result = await pool.query(query, [`%${term}%`]);
  return result.rows;
}

export async function getPostById(id) {
  const query = 'SELECT * FROM blog_posts WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

export async function updatePost(id, data) {
  const { title, content, category, tags } = data;
  const query = `
      UPDATE blog_posts 
      SET 
        title = COALESCE($2, title), 
        content = COALESCE($3, content), 
        category = COALESCE($4, category), 
        tags = COALESCE($5, tags),
        updated_at = NOW()
      WHERE id = $1
      RETURNING *;
    `;
  const result = await pool.query(query, [id, title || null, content || null, category || null, tags ? JSON.stringify(tags) : null]);
  return result.rows[0];
}

export async function deletePost(id) {
  const query = 'DELETE FROM blog_posts WHERE id = $1 RETURNING *';
  const result = await pool.query(query, [id]);
  return result.rows[0];
}