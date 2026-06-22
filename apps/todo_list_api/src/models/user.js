import pool from "../config/database.js";

/**
 * Creates a new user in the database.
 * 
 * @param {string} name - The name for the new user.
 * @param {string} email - The email address for the new user.
 * @param {string} password - The hashed password for the new user.
 * @returns {Promise<Object>} The created user object.
 * @throws {Error} If the username is already taken or if the query fails.
 */
export async function createUser(name, email, password) {
    const query = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at
    `;
    const values = [name, email, password];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        if (error.code === '23505') { throw new Error('Username or email already taken'); }
        throw error;
    }
}

/**
 * Retrieves a user by their email address.
 * 
 * @param {string} email - The email address of the user to retrieve.
 * @returns {Promise<Object|null>} The user object if found, otherwise null.
 * @throws {Error} If the query fails.
 */
export async function getUserByEmail(email) {
    const query = `
        SELECT id, name, email, password, created_at
        FROM users
        WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
}