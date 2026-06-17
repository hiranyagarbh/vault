import { Pool } from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    max: process.env.DB_MAX_CONNECTIONS || 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
})

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
})

export default pool;

async function StartPool() {
    console.log('Connecting to PostgreSQL database...');
    try {
        await pool.query('SELECT NOW()');
        console.log('Successfully connected to database.')
    } catch (error) {
        console.log('Error connecting to database');
    }
}

StartPool();