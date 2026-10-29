const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');
const deviceAuth = require('../middleware/deviceAuth');

// POST /api/sensor-data - Receive and ingest ESP32 sensor telemetry
router.post('/', deviceAuth, sensorController.postSensorData);

// GET /api/sensor-data - Retrieve sensor history with range filters & pagination
router.get('/', sensorController.getSensorHistory);

// GET /api/sensor-data/latest - Retrieve the latest reading and connection state
router.get('/latest', sensorController.getLatestReading);

// GET /api/sensor-data/stats - Retrieve aggregated statistics
router.get('/stats', sensorController.getSensorStats);

module.exports = router;
