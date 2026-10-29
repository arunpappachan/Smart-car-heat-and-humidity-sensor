const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL Connection Pool Configuration
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'smart_car_iot',
  user: process.env.DB_USER || 'smart_car_user',
  password: process.env.DB_PASSWORD || 'smart_car_pass_2026',
  max: 20, // Max concurrent clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// If DATABASE_URL is supplied (e.g. Render, Neon, or cloud Postgres), use it directly with SSL support
if (process.env.DATABASE_URL) {
  delete poolConfig.host;
  delete poolConfig.port;
  delete poolConfig.database;
  delete poolConfig.user;
  delete poolConfig.password;
  poolConfig.connectionString = process.env.DATABASE_URL;
  // Cloud providers like Render enforce SSL
  if (process.env.DB_SSL !== 'false') {
    poolConfig.ssl = { rejectUnauthorized: false };
  }
} else if (process.env.DB_SSL === 'true') {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[Database Pool Error]: Unexpected idle client error', err.message);
});

/**
 * Execute a query with parameters
 * @param {string} text SQL query
 * @param {Array} params Query parameters
 * @returns {Promise<any>}
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV === 'development') {
      console.log('[DB Query]', { text: text.substring(0, 80), duration: `${duration}ms`, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('[DB Query Error]:', error.message, 'Query:', text);
    throw error;
  }
};

/**
 * Self-healing Schema Initialization
 * Ensures tables exist even if Docker init.sql was bypassed
 */
const initDatabaseSchema = async () => {
  try {
    console.log('[DB] Ensuring database schema and tables are initialized...');
    await query(`
      CREATE TABLE IF NOT EXISTS devices (
        id SERIAL PRIMARY KEY,
        device_id VARCHAR(50) UNIQUE NOT NULL,
        device_name VARCHAR(100) NOT NULL DEFAULT 'Smart Car Sentinel',
        last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sensor_readings (
        id BIGSERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
        temperature NUMERIC(5, 2) NOT NULL,
        humidity NUMERIC(5, 2) NOT NULL,
        status VARCHAR(20) NOT NULL CHECK (status IN ('NORMAL', 'WARNING', 'HIGH')),
        is_simulated BOOLEAN DEFAULT FALSE,
        recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id BIGSERIAL PRIMARY KEY,
        device_id VARCHAR(50) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('WARNING', 'HIGH', 'RESOLVED')),
        message TEXT NOT NULL,
        temperature NUMERIC(5, 2) NOT NULL,
        humidity NUMERIC(5, 2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time 
          ON sensor_readings (device_id, recorded_at DESC);

      CREATE INDEX IF NOT EXISTS idx_sensor_readings_time 
          ON sensor_readings (recorded_at DESC);

      CREATE INDEX IF NOT EXISTS idx_alerts_device_time 
          ON alerts (device_id, created_at DESC);

      INSERT INTO devices (device_id, device_name, last_seen, created_at)
      VALUES ('CAR_001', 'Smart Car Cabin Unit #1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT (device_id) DO NOTHING;
    `);
    console.log('[DB] Database schema verified successfully.');
  } catch (error) {
    console.warn('[DB] Schema auto-init warning (Database might still be starting):', error.message);
  }
};

/**
 * Health check test
 */
const healthCheck = async () => {
  try {
    const result = await pool.query('SELECT NOW() as current_time, count(*) as count FROM devices');
    return {
      status: 'healthy',
      time: result.rows[0].current_time,
      devicesCount: parseInt(result.rows[0].count, 10),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
};

module.exports = {
  pool,
  query,
  initDatabaseSchema,
  healthCheck,
};
