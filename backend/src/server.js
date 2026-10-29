const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const { initDatabaseSchema, healthCheck } = require('./config/database');
const sensorRoutes = require('./routes/sensorRoutes');
const alertRoutes = require('./routes/alertRoutes');
const { getHealth, getThresholds } = require('./controllers/sensorController');
const simulationController = require('./controllers/simulationController');
const simulator = require('./services/simulator');

const app = express();
const server = http.createServer(app);

// CORS configuration supporting Docker, React dev server, and local network ESP32
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000', '*'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or ESP32)
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid blocking ESP32
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Socket.IO Real-Time Engine Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  pingTimeout: 10000,
  pingInterval: 5000,
});

// Attach io instance to express app so controllers can access it
app.set('io', io);
simulator.setApp(app);

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial acknowledgment
  socket.emit('connection_established', {
    message: 'Connected to Smart Car Monitoring Stream',
    socketId: socket.id,
    timestamp: new Date().toISOString(),
  });

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id} (Reason: ${reason})`);
  });
});

// Periodic Device Heartbeat / Liveness Watchdog (only when not in unit tests)
let livenessInterval = null;
if (process.env.NODE_ENV !== 'test') {
  livenessInterval = setInterval(async () => {
    try {
      const { offlineTimeoutSeconds } = getThresholds();
      const { query } = require('./config/database');
      const deviceResult = await query(
        `SELECT device_id, last_seen, 
                EXTRACT(EPOCH FROM (NOW() - last_seen))::int AS seconds_ago 
         FROM devices`
      );

      deviceResult.rows.forEach((dev) => {
        const isOnline = dev.seconds_ago <= offlineTimeoutSeconds;
        io.emit('device_status', {
          device_id: dev.device_id,
          is_online: isOnline,
          seconds_ago: dev.seconds_ago,
          last_seen: dev.last_seen,
          status: isOnline ? 'ONLINE' : 'SENSOR OFFLINE',
        });
      });
    } catch (err) {
      // Database might be booting or connecting; ignore periodic noise
    }
  }, 5000);
}

// API Route Mounts
app.use('/api/sensor-data', sensorRoutes);
app.use('/api/alerts', alertRoutes);
app.get('/api/health', getHealth);

// Simulation Management Endpoints
app.get('/api/simulation/status', simulationController.getSimulationStatus);
app.post('/api/simulation/start', simulationController.startSimulation);
app.post('/api/simulation/stop', simulationController.stopSimulation);
app.post('/api/simulation/scenario', simulationController.setScenario);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    project: 'Smart Car Heat and Humidity Monitoring System Using ESP32',
    description: 'MCA IoT Mini Project Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      sensor_data: '/api/sensor-data',
      latest_data: '/api/sensor-data/latest',
      stats: '/api/sensor-data/stats',
      alerts: '/api/alerts',
      simulation: '/api/simulation/status',
    },
    documentation: 'See README.md for full specs',
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err.stack || err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message,
  });
});

const PORT = parseInt(process.env.PORT || '3000', 10);

// Only listen if not loaded by a test runner
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, '0.0.0.0', async () => {
    console.log('====================================================');
    console.log(`🚗 Smart Car IoT Backend Server is active on port ${PORT}`);
    console.log(`📡 REST API Base: http://localhost:${PORT}/api/sensor-data`);
    console.log(`⚡ WebSocket Stream: ws://localhost:${PORT}`);
    console.log('====================================================');

    // Run schema initialization
    await initDatabaseSchema();
  });
}

// Graceful termination
const shutdown = () => {
  clearInterval(livenessInterval);
  simulator.stop();
  server.close(() => {
    console.log('[Server] Gracefully terminated HTTP & Socket.IO services');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = { app, server, io };
