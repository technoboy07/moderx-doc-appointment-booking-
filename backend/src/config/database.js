import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { Pool } = pg;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vercel Postgres sets 'POSTGRES_URL' automatically.
// We also keep DATABASE_URL as a fallback.
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }, // Required for Vercel Postgres
  max: 5, // Reduce max connections for Serverless (prevents exhaustion)
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Global variable to cache the pool in development (prevents hot-reload connection leaks)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return pool;

  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected');

    // Initialize Schema (Only if running for the first time or needing updates)
    // Note: In serverless, reading files every request is slow. 
    // Ideally, run schema migrations separately, but this works for now.
    try {
      // Adjusted path to look for schema.sql
      const schemaPath = path.join(__dirname, '../schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSQL);
        console.log('✅ Database schema checked/initialized');
      } else {
        console.warn('⚠️ Schema file not found at:', schemaPath);
      }
    } catch (schemaError) {
      console.error('ℹ️ Schema init warning:', schemaError.message);
    }

    client.release();
    isConnected = true;
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    // Do not exit process in serverless, just throw
    throw error;
  }
};

export default connectDB;
export { pool };
