import pool from "../config/database.js";

/**
 * Creates a new todo in the database.
 * 
 * @param {number} userId - The ID of the user.
 * @param {string} title - The title of the todo.
 * @param {string} description - The description of the todo.
 * @returns {Promise<Object>} The created todo object.
 * @throws {Error} If the query fails.
 */

export async function createTodo(userId, title, description) {
    const query = "INSERT INTO todos (user_id, title, description) VALUES ($1, $2, $3) RETURNING *";
    const values = [userId, title, description];
    const result = await pool.query(query, values);
    return result.rows[0];
}

export async function getAllTodos(userId, page, limit) {
    const query = "SELECT * FROM todos WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3";
    const values = [userId, limit, (page - 1) * limit];
    const result = await pool.query(query, values);
    return result.rows;
}

export async function getTodoById(userId, id) {
    const query = "SELECT * FROM todos WHERE user_id = $1 AND id = $2";
    const values = [userId, id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
}

export async function updateTodo(userId, id, title, description) {
    const query = "UPDATE todos SET title = $1, description = $2, updated_at = NOW() WHERE user_id = $3 AND id = $4 RETURNING *;";
    const values = [title, description, userId, id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
}

export async function deleteTodo(userId, id) {
    const query = "DELETE FROM todos WHERE user_id = $1 AND id = $2 RETURNING *;";
    const values = [userId, id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
}

export async function getTotalTodos(userId) {
    const query = "SELECT COUNT(*) FROM todos WHERE user_id = $1";
    const result = await pool.query(query, [userId]);
    return Number(result.rows[0].count);
}