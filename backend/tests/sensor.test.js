const request = require('supertest');

// Mock the database module so unit tests can run standalone without a live PostgreSQL instance
jest.mock('../src/config/database', () => {
  const mockRows = [];
  return {
    query: jest.fn(async (text, params) => {
      // Health check query
      if (text.includes('SELECT NOW()')) {
        return { rows: [{ current_time: new Date().toISOString() }], rowCount: 1 };
      }
      // Upsert device
      if (text.includes('INSERT INTO devices')) {
        return { rows: [{ device_id: params[0] }], rowCount: 1 };
      }
      // Previous reading check
      if (text.includes('FROM sensor_readings') && text.includes('LIMIT 1')) {
        return { rows: [{ status: 'NORMAL' }], rowCount: 1 };
      }
      // Insert sensor reading
      if (text.includes('INSERT INTO sensor_readings')) {
        return {
          rows: [
            {
              id: 1,
              device_id: params[0],
              temperature: params[1],
              humidity: params[2],
              status: params[3],
              is_simulated: params[4],
              recorded_at: new Date().toISOString(),
            },
          ],
          rowCount: 1,
        };
      }
      // Insert alert
      if (text.includes('INSERT INTO alerts')) {
        return {
          rows: [
            {
              id: 10,
              device_id: params[0],
              alert_type: params[1],
              message: params[2],
              temperature: params[3],
              humidity: params[4],
              created_at: new Date().toISOString(),
            },
          ],
          rowCount: 1,
        };
      }
      // Stats query
      if (text.includes('total_readings')) {
        return {
          rows: [
            {
              total_readings: '25',
              min_temperature: '26.0',
              max_temperature: '38.5',
              avg_temperature: '31.2',
              min_humidity: '45.0',
              max_humidity: '70.0',
              avg_humidity: '55.5',
              high_status_count: '4',
              warning_status_count: '6',
              normal_status_count: '15',
            },
          ],
          rowCount: 1,
        };
      }
      // History count
      if (text.includes('COUNT(*) AS total FROM') || (text.includes('COUNT(*) AS total') && !text.includes('total_readings'))) {
        return { rows: [{ total: '5' }], rowCount: 1 };
      }
      // History query
      if (text.includes('SELECT id, device_id, temperature, humidity, status')) {
        return {
          rows: [
            {
              id: 1,
              device_id: 'CAR_001',
              temperature: 28.5,
              humidity: 55.0,
              status: 'NORMAL',
              is_simulated: false,
              recorded_at: new Date().toISOString(),
            },
          ],
          rowCount: 1,
        };
      }
      // Stats query
      if (text.includes('MIN(temperature)')) {
        return {
          rows: [
            {
              total_readings: '25',
              min_temperature: '26.0',
              max_temperature: '38.5',
              avg_temperature: '31.2',
              min_humidity: '45.0',
              max_humidity: '70.0',
              avg_humidity: '55.5',
              high_status_count: '4',
              warning_status_count: '6',
              normal_status_count: '15',
            },
          ],
          rowCount: 1,
        };
      }
      // Alerts query
      if (text.includes('COUNT(*) AS total FROM alerts')) {
        return { rows: [{ total: '2' }], rowCount: 1 };
      }
      if (text.includes('SELECT id, device_id, alert_type, message')) {
        return {
          rows: [
            {
              id: 1,
              device_id: 'CAR_001',
              alert_type: 'HIGH',
              message: 'CRITICAL: Cabin temperature reached 38.5°C!',
              temperature: 38.5,
              humidity: 60.0,
              created_at: new Date().toISOString(),
            },
          ],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    }),
    initDatabaseSchema: jest.fn().mockResolvedValue(true),
    healthCheck: jest.fn().mockResolvedValue({ status: 'healthy' }),
    pool: { end: jest.fn() },
  };
});

const { app } = require('../src/server');
const { calculateStatus } = require('../src/controllers/sensorController');

describe('Smart Car IoT Backend API Unit & Integration Tests', () => {
  describe('Rule-Based Temperature Status Calculation', () => {
    test('Calculates NORMAL for temperature below 30.0°C', () => {
      expect(calculateStatus(25.0)).toBe('NORMAL');
      expect(calculateStatus(29.9)).toBe('NORMAL');
    });

    test('Calculates WARNING for temperature between 30.0°C and 34.9°C', () => {
      expect(calculateStatus(30.0)).toBe('WARNING');
      expect(calculateStatus(32.4)).toBe('WARNING');
      expect(calculateStatus(34.9)).toBe('WARNING');
    });

    test('Calculates HIGH for temperature 35.0°C and above', () => {
      expect(calculateStatus(35.0)).toBe('HIGH');
      expect(calculateStatus(38.5)).toBe('HIGH');
      expect(calculateStatus(45.0)).toBe('HIGH');
    });
  });

  describe('GET /api/health', () => {
    test('Returns 200 OK with health metadata', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.service).toBe('smart-car-iot-backend');
      expect(res.body.thresholds).toBeDefined();
      expect(res.body.thresholds.normal_max).toBe(30);
      expect(res.body.thresholds.high_min).toBe(35);
    });
  });

  describe('POST /api/sensor-data validation', () => {
    test('Fails with 400 when device_id is missing', async () => {
      const res = await request(app)
        .post('/api/sensor-data')
        .send({ temperature: 31.0, humidity: 50.0 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('device_id');
    });

    test('Fails with 400 when temperature is out of range', async () => {
      const res = await request(app)
        .post('/api/sensor-data')
        .send({ device_id: 'CAR_001', temperature: 150.0, humidity: 50.0 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('temperature');
    });

    test('Fails with 400 when humidity is invalid', async () => {
      const res = await request(app)
        .post('/api/sensor-data')
        .send({ device_id: 'CAR_001', temperature: 32.0, humidity: 120.0 });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('humidity');
    });

    test('Successfully accepts valid telemetry and applies authoritative status', async () => {
      const res = await request(app)
        .post('/api/sensor-data')
        .send({
          device_id: 'CAR_001',
          temperature: 36.8,
          humidity: 55.4,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.device_id).toBe('CAR_001');
      expect(res.body.data.status).toBe('HIGH');
      expect(res.body.data.temperature).toBe(36.8);
    });
  });

  describe('GET /api/sensor-data historical queries', () => {
    test('Returns sensor history with pagination and range info', async () => {
      const res = await request(app).get('/api/sensor-data?range=1h&limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.readings)).toBe(true);
      expect(res.body.total).toBe(5);
    });
  });

  describe('GET /api/sensor-data/stats', () => {
    test('Returns aggregate telemetry statistics', async () => {
      const res = await request(app).get('/api/sensor-data/stats?range=24h');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.min_temperature).toBe('26.0');
      expect(res.body.stats.max_temperature).toBe('38.5');
    });
  });

  describe('GET /api/alerts', () => {
    test('Returns alert event history', async () => {
      const res = await request(app).get('/api/alerts?limit=10');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.alerts)).toBe(true);
      expect(res.body.alerts[0].alert_type).toBe('HIGH');
    });
  });
});
