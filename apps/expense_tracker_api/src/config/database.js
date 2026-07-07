import { Pool } from 'pg';

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || 5432),
    max: parseInt(process.env.DB_MAX_CONNECTIONS || 20),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
})

pool.on('error', (err, client) => {
    console.error(`[DB] Unexpected error on idle client: ${err.message}`);
    console.error(`[DB] Error code: ${err.code || 'N/A'}`);
    process.exit(1);
})

export async function initializeDatabase() {
    try {
        const result = await pool.query('SELECT NOW() AS server_time');
        const serverTime = result.rows[0].server_time;
        console.log(`[DB] Connected to PostgreSQL (${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME})`);
        console.log(`[DB] Server time: ${serverTime}`);
        console.log(`[DB] Pool size: max ${pool.options.max} connections`);
    } catch (error) {
        console.error(`[DB] Failed to connect to PostgreSQL: ${error.message}`);
        console.error(`[DB] Connection config: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
        throw error;
    }
}

export async function closeDatabase() {
    try {
        await pool.end();
        console.log('[DB] Pool connections closed');
    } catch (error) {
        console.error(`[DB] Error closing pool: ${error.message}`);
    }
}

export default pool;