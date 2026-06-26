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
/**
 * Creates a new session for a user.
 * 
 * @param {number} user_id - The ID of the user to create a session for.
 * @param {string} refresh_token - The refresh token for the new session.
 * @param {Date} expires_at - The expiration date and time for the new session.
 * @returns {Promise<Object>} The created session object.
 * @throws {Error} If the query fails.
 */

export async function createSession(user_id, refresh_token, expires_at) {
    const query = `
        INSERT INTO sessions (user_id, refresh_token, expires_at)
        VALUES ($1, $2, $3)
        RETURNING id, user_id, refresh_token, created_at, updated_at, expires_at
    `;
    const values = [user_id, refresh_token, expires_at];

    try {
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
}

/**
 * getSession - Retrieves a session by its refresh token.
 * @param {string} refresh_token - The refresh token to retrieve the session for.
 * @returns {Promise<Object|null>} The session object if found, otherwise null.
 * @throws {Error} If the query fails.
 */
export async function getSession(refresh_token) {
    const query = `
        SELECT id, user_id, refresh_token, created_at, updated_at, expires_at
        FROM sessions
        WHERE refresh_token = $1
    `;
    const result = await pool.query(query, [refresh_token]);
    return result.rows[0] || null;
}

/**
 * deleteSession - Deletes a session by its refresh token.
 * @param {string} refresh_token - The refresh token to delete the session for.
 * @returns {Promise<Object|null>} The session object if found, otherwise null.
 * @throws {Error} If the query fails.
 */
export async function deleteSession(refresh_token) {
    const query = `
        DELETE FROM sessions
        WHERE refresh_token = $1
        RETURNING id, user_id, refresh_token, created_at, updated_at, expires_at
    `;
    const result = await pool.query(query, [refresh_token]);
    return result.rows[0] || null;
}