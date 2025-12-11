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

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRESQL_URI,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ PostgreSQL pool connected');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

// Connect to database and initialize schema
const connectDB = async () => {
  try {
    // Test connection
    const client = await pool.connect();
    console.log('✅ PostgreSQL Connected');
    
    // Initialize schema if tables don't exist
    try {
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      
      await client.query(schemaSQL);
      console.log('✅ Database schema initialized');
    } catch (schemaError) {
      // Schema might already exist, that's okay
      if (schemaError.code !== '42P07') { // 42P07 = relation already exists
        console.log('ℹ️  Schema initialization skipped:', schemaError.message);
      } else {
        console.log('ℹ️  Schema already exists');
      }
    }
    
    client.release();
    return pool;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
export { pool };
