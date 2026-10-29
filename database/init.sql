-- ==============================================================================
-- MCA Mini Project: Smart Car Heat and Humidity Monitoring System Using ESP32
-- Database Initialization Script (PostgreSQL)
-- Database Name: smart_car_iot
-- ==============================================================================

-- Create extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- Table 1: devices
-- Stores registered IoT monitoring hardware and last communication timestamp
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(50) UNIQUE NOT NULL,
    device_name VARCHAR(100) NOT NULL DEFAULT 'Smart Car Sentinel',
    last_seen TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Table 2: sensor_readings
-- High-frequency telemetry logged from ESP32 DHT22 sensor readings
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    temperature NUMERIC(5, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('NORMAL', 'WARNING', 'HIGH')),
    is_simulated BOOLEAN DEFAULT FALSE,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Table 3: alerts
-- Recorded temperature threshold violation and state transition events
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('WARNING', 'HIGH', 'RESOLVED')),
    message TEXT NOT NULL,
    temperature NUMERIC(5, 2) NOT NULL,
    humidity NUMERIC(5, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- Indexes for High Performance Queries and Real-Time Dashboard Lookups
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device_time 
    ON sensor_readings (device_id, recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_sensor_readings_time 
    ON sensor_readings (recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_alerts_device_time 
    ON alerts (device_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_devices_last_seen 
    ON devices (last_seen DESC);

-- ------------------------------------------------------------------------------
-- Seed Default Demonstration Vehicle Device
-- ------------------------------------------------------------------------------
INSERT INTO devices (device_id, device_name, last_seen, created_at)
VALUES ('CAR_001', 'Smart Car Cabin Unit #1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (device_id) DO NOTHING;

-- Initial benchmark reading to verify storage immediately on startup
INSERT INTO sensor_readings (device_id, temperature, humidity, status, is_simulated, recorded_at)
VALUES ('CAR_001', 28.5, 55.0, 'NORMAL', true, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;
