const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensorController');

// GET /api/alerts - Retrieve warning and critical event history
router.get('/', sensorController.getAlerts);

module.exports = router;
