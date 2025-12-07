const { drizzle } = require("drizzle-orm/node-postgres");
const { Pool } = require("pg")
const { schema } = require('./src/db/schema');

console.log("process env:", process.env.DATABASE_URL)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { require: true, rejectUnauthorized: false }
});

const db = drizzle(pool, {schema});

module.exports = db;