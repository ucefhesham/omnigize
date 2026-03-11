const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function testConnection() {
  try {
    await client.connect();
    console.log('Connected successfully to Neon!');
    const res = await client.query('SELECT nspname FROM pg_catalog.pg_namespace;');
    console.log('Schemas in database:', res.rows);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.stack);
    process.exit(1);
  }
}

testConnection();
