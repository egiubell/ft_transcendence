import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'ponguser',
  password: process.env.DB_PASS || 'securepassword',
  host: process.env.DB_HOST || 'db',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'transcendence'
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
