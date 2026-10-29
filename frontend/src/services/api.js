import axios from 'axios';
import { io } from 'socket.io-client';

// Determine API base URL
let rawBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

// Fix Render internal hostnames lacking TLD (e.g. 'smart-car-backend' -> 'https://smart-car-backend.onrender.com')
if (!rawBaseUrl || rawBaseUrl === 'smart-car-backend' || rawBaseUrl === 'https://smart-car-backend' || (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com'))) {
  rawBaseUrl = 'https://smart-car-backend.onrender.com';
}

if (rawBaseUrl && !rawBaseUrl.startsWith('http://') && !rawBaseUrl.startsWith('https://')) {
  rawBaseUrl = `https://${rawBaseUrl}`;
}

export const API_BASE_URL = rawBaseUrl;
console.log('[API] Target Backend Base URL:', API_BASE_URL || '(relative)');

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REST API Endpoints
export const getLatestReading = async (deviceId = 'CAR_001') => {
  const response = await apiClient.get('/api/sensor-data/latest', {
    params: { device_id: deviceId },
  });
  return response.data;
};

export const getSensorHistory = async ({
  deviceId = 'CAR_001',
  range = '1h',
  limit = 50,
  offset = 0,
  status,
} = {}) => {
  const response = await apiClient.get('/api/sensor-data', {
    params: {
      device_id: deviceId,
      range,
      limit,
      offset,
      status: status || undefined,
    },
  });
  return response.data;
};

export const getSensorStats = async (deviceId = 'CAR_001', range = '24h') => {
  const response = await apiClient.get('/api/sensor-data/stats', {
    params: { device_id: deviceId, range },
  });
  return response.data;
};

export const getAlerts = async ({ deviceId = 'CAR_001', limit = 20, offset = 0 } = {}) => {
  const response = await apiClient.get('/api/alerts', {
    params: { device_id: deviceId, limit, offset },
  });
  return response.data;
};

export const getBackendHealth = async () => {
  const response = await apiClient.get('/api/health');
  return response.data;
};

// Simulation Management APIs
export const getSimulationStatus = async () => {
  const response = await apiClient.get('/api/simulation/status');
  return response.data;
};

export const startSimulation = async (mode = 'auto', deviceId = 'CAR_001') => {
  const response = await apiClient.post('/api/simulation/start', {
    mode,
    device_id: deviceId,
  });
  return response.data;
};

export const stopSimulation = async () => {
  const response = await apiClient.post('/api/simulation/stop');
  return response.data;
};

export const setSimulationScenario = async (scenario) => {
  const response = await apiClient.post('/api/simulation/scenario', { scenario });
  return response.data;
};

// Real-Time Socket.IO Client Setup
let socket = null;

export const initSocketConnection = () => {
  if (!socket) {
    // If running on Render or remote, target backend URL
    let socketUrl = API_BASE_URL || import.meta.env.VITE_SOCKET_URL || window.location.origin;
    if (socketUrl && !socketUrl.startsWith('http://') && !socketUrl.startsWith('https://') && !socketUrl.startsWith('ws://') && !socketUrl.startsWith('wss://')) {
      socketUrl = `https://${socketUrl}`;
    }

    console.log('[Socket.IO] Connecting to WebSocket host:', socketUrl);

    socket = io(socketUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 25,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] Connected to backend server:', socket.id);
    });

    socket.on('disconnect', (reason) => {
      console.warn('[Socket.IO] Disconnected from server:', reason);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket.IO Connection Error]:', error.message);
    });
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocketConnection();
  }
  return socket;
};
