const { Pool } = require('pg');

// Create a new pool using credentials from the .env file
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Function to test the connection and log status
const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ PostgreSQL connected successfully to traffico_db!');
    client.release();
  } catch (err) {
    console.error('❌ PostgreSQL connection error:', err.message);
    // Exit process on connection failure
    process.exit(1);
  }
};

module.exports = {
  pool,
  connectDB
};