const { query } = require('../config/database');

// Configurable thresholds with fallback defaults
const getThresholds = () => ({
  normal: parseFloat(process.env.TEMP_NORMAL_THRESHOLD || '30.0'),
  high: parseFloat(process.env.TEMP_HIGH_THRESHOLD || '35.0'),
  offlineTimeoutSeconds: parseInt(process.env.OFFLINE_TIMEOUT_SECONDS || '20', 10),
});

/**
 * Determine authoritative status based on temperature
 * @param {number} temp Temperature in Celsius
 * @returns {'NORMAL' | 'WARNING' | 'HIGH'}
 */
const calculateStatus = (temp) => {
  const { normal, high } = getThresholds();
  if (temp < normal) {
    return 'NORMAL';
  } else if (temp < high) {
    return 'WARNING';
  } else {
    return 'HIGH';
  }
};

/**
 * POST /api/sensor-data
 * Ingest telemetry reading from ESP32 or Simulator
 */
const postSensorData = async (req, res) => {
  try {
    const { device_id, temperature, humidity, is_simulated } = req.body;

    // 1. Validation
    if (!device_id || typeof device_id !== 'string' || device_id.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Validation Error: "device_id" is required and must be a non-empty string.',
      });
    }

    const tempNum = parseFloat(temperature);
    const humNum = parseFloat(humidity);

    if (isNaN(tempNum) || tempNum < -40.0 || tempNum > 85.0) {
      return res.status(400).json({
        success: false,
        error: `Validation Error: "temperature" (${temperature}) must be a valid number between -40°C and 85°C.`,
      });
    }

    if (isNaN(humNum) || humNum < 0.0 || humNum > 100.0) {
      return res.status(400).json({
        success: false,
        error: `Validation Error: "humidity" (${humidity}) must be a valid percentage between 0% and 100%.`,
      });
    }

    const cleanDeviceId = device_id.trim().toUpperCase();
    const authoritativeStatus = calculateStatus(tempNum);
    const simulatedFlag = Boolean(is_simulated);

    // 2. Fetch the most recent reading to detect state transitions for alerts
    const previousReadingResult = await query(
      `SELECT status FROM sensor_readings 
       WHERE device_id = $1 
       ORDER BY recorded_at DESC 
       LIMIT 1`,
      [cleanDeviceId]
    );
    const previousStatus = previousReadingResult.rows.length > 0 ? previousReadingResult.rows[0].status : null;

    // 3. Upsert device entry
    await query(
      `INSERT INTO devices (device_id, device_name, last_seen)
       VALUES ($1, $2, CURRENT_TIMESTAMP)
       ON CONFLICT (device_id) 
       DO UPDATE SET last_seen = CURRENT_TIMESTAMP`,
      [cleanDeviceId, `Smart Car Sentinel (${cleanDeviceId})`]
    );

    // 4. Save sensor reading with server timestamp
    const insertReadingQuery = `
      INSERT INTO sensor_readings (device_id, temperature, humidity, status, is_simulated, recorded_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, device_id, temperature, humidity, status, is_simulated, recorded_at
    `;
    const readingResult = await query(insertReadingQuery, [
      cleanDeviceId,
      tempNum,
      humNum,
      authoritativeStatus,
      simulatedFlag,
    ]);
    const savedReading = readingResult.rows[0];

    // 5. Alert Deduplication & State Transition Logic
    let generatedAlert = null;
    let shouldCreateAlert = false;
    let alertType = null;
    let alertMessage = null;

    // State transition rules:
    // NORMAL -> WARNING
    // NORMAL / WARNING -> HIGH
    // HIGH / WARNING -> RESOLVED (NORMAL)
    if (authoritativeStatus === 'HIGH' && previousStatus !== 'HIGH') {
      shouldCreateAlert = true;
      alertType = 'HIGH';
      alertMessage = `CRITICAL: Cabin temperature reached ${tempNum.toFixed(1)}°C! High cabin temperature detected. Ventilate vehicle and activate air conditioning immediately.`;
    } else if (authoritativeStatus === 'WARNING' && previousStatus === 'NORMAL') {
      shouldCreateAlert = true;
      alertType = 'WARNING';
      alertMessage = `CAUTION: Cabin temperature has increased to ${tempNum.toFixed(1)}°C. Cabin is heating up rapidly in sunlight.`;
    } else if (authoritativeStatus === 'NORMAL' && (previousStatus === 'WARNING' || previousStatus === 'HIGH')) {
      shouldCreateAlert = true;
      alertType = 'RESOLVED';
      alertMessage = `RESOLVED: Cabin temperature has returned to normal range (${tempNum.toFixed(1)}°C). Safe ambient level restored.`;
    }

    if (shouldCreateAlert && alertType && alertMessage) {
      const alertInsertQuery = `
        INSERT INTO alerts (device_id, alert_type, message, temperature, humidity, created_at)
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING id, device_id, alert_type, message, temperature, humidity, created_at
      `;
      const alertResult = await query(alertInsertQuery, [
        cleanDeviceId,
        alertType,
        alertMessage,
        tempNum,
        humNum,
      ]);
      generatedAlert = alertResult.rows[0];
    }

    // 6. Real-time updates via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const socketPayload = {
        ...savedReading,
        is_online: true,
      };
      io.emit('sensor_data', socketPayload);

      if (generatedAlert) {
        io.emit('new_alert', generatedAlert);
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Sensor reading recorded successfully.',
      data: savedReading,
      alert: generatedAlert,
    });
  } catch (error) {
    console.error('[postSensorData Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to store sensor reading.',
      details: error.message,
    });
  }
};

/**
 * GET /api/sensor-data
 * Retrieve historical sensor readings with range filtering and pagination
 */
const getSensorHistory = async (req, res) => {
  try {
    const { device_id, limit = 50, offset = 0, range = '1h', status } = req.query;
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500);
    const offsetNum = Math.max(parseInt(offset, 10) || 0, 0);

    let timeFilter = '';
    switch (range) {
      case '15m':
        timeFilter = "AND recorded_at >= NOW() - INTERVAL '15 minutes'";
        break;
      case '1h':
        timeFilter = "AND recorded_at >= NOW() - INTERVAL '1 hour'";
        break;
      case '24h':
        timeFilter = "AND recorded_at >= NOW() - INTERVAL '24 hours'";
        break;
      case 'all':
      default:
        timeFilter = '';
        break;
    }

    let statusFilter = '';
    const queryParams = [];
    let paramIndex = 1;

    if (device_id) {
      statusFilter += ` AND device_id = $${paramIndex}`;
      queryParams.push(device_id.trim().toUpperCase());
      paramIndex++;
    }

    if (status && ['NORMAL', 'WARNING', 'HIGH'].includes(status.toUpperCase())) {
      statusFilter += ` AND status = $${paramIndex}`;
      queryParams.push(status.toUpperCase());
      paramIndex++;
    }

    const countQuery = `
      SELECT COUNT(*) AS total 
      FROM sensor_readings 
      WHERE 1=1 ${timeFilter} ${statusFilter}
    `;
    const countResult = await query(countQuery, queryParams);
    const total = countResult && countResult.rows && countResult.rows.length > 0
      ? parseInt(countResult.rows[0].total, 10) || 0
      : 0;

    const dataQuery = `
      SELECT id, device_id, temperature, humidity, status, is_simulated, recorded_at
      FROM sensor_readings
      WHERE 1=1 ${timeFilter} ${statusFilter}
      ORDER BY recorded_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    const dataParams = [...queryParams, limitNum, offsetNum];
    const dataResult = await query(dataQuery, dataParams);

    return res.json({
      success: true,
      total,
      range,
      limit: limitNum,
      offset: offsetNum,
      readings: dataResult.rows,
    });
  } catch (error) {
    console.error('[getSensorHistory Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve sensor history.',
      details: error.message,
    });
  }
};

/**
 * GET /api/sensor-data/latest
 * Retrieve the most recent sensor reading and calculate real-time connection status
 */
const getLatestReading = async (req, res) => {
  try {
    const { device_id = 'CAR_001' } = req.query;
    const cleanDeviceId = device_id.trim().toUpperCase();
    const { normal, high, offlineTimeoutSeconds } = getThresholds();

    // Fetch device record
    const deviceResult = await query(
      `SELECT device_id, device_name, last_seen, created_at 
       FROM devices 
       WHERE device_id = $1`,
      [cleanDeviceId]
    );

    // Fetch latest reading
    const readingResult = await query(
      `SELECT id, device_id, temperature, humidity, status, is_simulated, recorded_at
       FROM sensor_readings
       WHERE device_id = $1
       ORDER BY recorded_at DESC
       LIMIT 1`,
      [cleanDeviceId]
    );

    const device = deviceResult.rows[0] || null;
    const latestReading = readingResult.rows[0] || null;

    let isOnline = false;
    let secondsSinceLastSeen = null;

    if (device && device.last_seen) {
      const lastSeenMs = new Date(device.last_seen).getTime();
      const nowMs = Date.now();
      secondsSinceLastSeen = Math.floor((nowMs - lastSeenMs) / 1000);
      isOnline = secondsSinceLastSeen <= offlineTimeoutSeconds;
    }

    return res.json({
      success: true,
      device_id: cleanDeviceId,
      device,
      is_online: isOnline,
      seconds_since_last_seen: secondsSinceLastSeen,
      offline_timeout_seconds: offlineTimeoutSeconds,
      thresholds: { normal, high },
      latest: latestReading,
    });
  } catch (error) {
    console.error('[getLatestReading Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve latest sensor reading.',
      details: error.message,
    });
  }
};

/**
 * GET /api/sensor-data/stats
 * Aggregate metrics across temperature and humidity
 */
const getSensorStats = async (req, res) => {
  try {
    const { device_id, range = '24h' } = req.query;
    let timeFilter = "recorded_at >= NOW() - INTERVAL '24 hours'";
    if (range === '15m') timeFilter = "recorded_at >= NOW() - INTERVAL '15 minutes'";
    if (range === '1h') timeFilter = "recorded_at >= NOW() - INTERVAL '1 hour'";
    if (range === 'all') timeFilter = "1=1";

    let deviceFilter = '';
    const queryParams = [];
    if (device_id) {
      deviceFilter = 'AND device_id = $1';
      queryParams.push(device_id.trim().toUpperCase());
    }

    const statsQuery = `
      SELECT 
        COUNT(*) AS total_readings,
        ROUND(MIN(temperature)::numeric, 1) AS min_temperature,
        ROUND(MAX(temperature)::numeric, 1) AS max_temperature,
        ROUND(AVG(temperature)::numeric, 1) AS avg_temperature,
        ROUND(MIN(humidity)::numeric, 1) AS min_humidity,
        ROUND(MAX(humidity)::numeric, 1) AS max_humidity,
        ROUND(AVG(humidity)::numeric, 1) AS avg_humidity,
        COUNT(CASE WHEN status = 'HIGH' THEN 1 END) AS high_status_count,
        COUNT(CASE WHEN status = 'WARNING' THEN 1 END) AS warning_status_count,
        COUNT(CASE WHEN status = 'NORMAL' THEN 1 END) AS normal_status_count
      FROM sensor_readings
      WHERE ${timeFilter} ${deviceFilter}
    `;

    const result = await query(statsQuery, queryParams);
    return res.json({
      success: true,
      range,
      stats: result.rows[0],
    });
  } catch (error) {
    console.error('[getSensorStats Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate sensor statistics.',
      details: error.message,
    });
  }
};

/**
 * GET /api/alerts
 * Retrieve warning history
 */
const getAlerts = async (req, res) => {
  try {
    const { device_id, limit = 50, offset = 0 } = req.query;
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 500);
    const offsetNum = Math.max(parseInt(offset, 10) || 0, 0);

    let deviceFilter = '';
    const params = [];
    if (device_id) {
      deviceFilter = 'WHERE device_id = $1';
      params.push(device_id.trim().toUpperCase());
    }

    const countQuery = `SELECT COUNT(*) AS total FROM alerts ${deviceFilter}`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].total, 10);

    const alertsQuery = `
      SELECT id, device_id, alert_type, message, temperature, humidity, created_at
      FROM alerts
      ${deviceFilter}
      ORDER BY created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    const dataParams = [...params, limitNum, offsetNum];
    const dataResult = await query(alertsQuery, dataParams);

    return res.json({
      success: true,
      total,
      limit: limitNum,
      offset: offsetNum,
      alerts: dataResult.rows,
    });
  } catch (error) {
    console.error('[getAlerts Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve alerts history.',
      details: error.message,
    });
  }
};

/**
 * GET /api/health
 * Backend system and database health check
 */
const getHealth = async (req, res) => {
  try {
    const dbTest = await query('SELECT NOW() as current_time');
    const { normal, high, offlineTimeoutSeconds } = getThresholds();

    return res.json({
      status: 'healthy',
      service: 'smart-car-iot-backend',
      timestamp: new Date().toISOString(),
      uptime_seconds: Math.floor(process.uptime()),
      database: {
        connected: true,
        db_time: dbTest.rows[0].current_time,
      },
      thresholds: {
        normal_max: normal,
        high_min: high,
        offline_timeout_seconds: offlineTimeoutSeconds,
      },
    });
  } catch (error) {
    return res.status(503).json({
      status: 'unhealthy',
      service: 'smart-car-iot-backend',
      error: 'Database connection failed',
      details: error.message,
    });
  }
};

module.exports = {
  postSensorData,
  getSensorHistory,
  getLatestReading,
  getSensorStats,
  getAlerts,
  getHealth,
  calculateStatus,
  getThresholds,
};
