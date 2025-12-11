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

// Vercel/Supabase provides 'POSTGRES_URL'
const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

if (!connectionString) {
  console.error("❌ No database connection string found! Check Environment Variables.");
}

// CHANGE THIS LINE
// Old: const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// New: Prioritize the NON_POOLING URL (Port 5432)
const connectionString = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // We still need this!
  },
  max: 5, // Keep low for direct connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected to Vercel/Supabase');
    
    // Initialize schema if needed
    try {
      // NOTE: Ensure schema.sql is actually in 'src/database/schema.sql' or update this path!
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      
      if (fs.existsSync(schemaPath)) {
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        await client.query(schemaSQL);
        console.log('✅ Database schema verified');
      } else {
        console.warn('⚠️ Schema file not found at:', schemaPath);
      }
    } catch (schemaError) {
      console.log('ℹ️ Schema check skipped:', schemaError.message);
    }
    
    client.release();
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    throw error;
  }
};

export default connectDB;
export { pool };
