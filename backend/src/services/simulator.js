const { postSensorData } = require('../controllers/sensorController');

class SimulatorService {
  constructor() {
    this.timer = null;
    this.isRunning = false;
    this.deviceId = 'CAR_001';
    this.intervalMs = 4000; // Emit every 4 seconds
    this.currentTemp = 27.5;
    this.currentHumidity = 58.0;
    this.mode = 'auto'; // 'auto' | 'heatwave' | 'cooldown'
    this.phase = 'heating'; // 'heating' | 'cooling'
    this.step = 0;
    this.app = null;
  }

  setApp(app) {
    this.app = app;
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      deviceId: this.deviceId,
      intervalMs: this.intervalMs,
      currentTemp: parseFloat(this.currentTemp.toFixed(1)),
      currentHumidity: parseFloat(this.currentHumidity.toFixed(1)),
      mode: this.mode,
      phase: this.phase,
    };
  }

  start(customMode = 'auto', deviceId = 'CAR_001') {
    if (this.isRunning) return this.getStatus();
    this.mode = customMode;
    this.deviceId = deviceId;
    this.isRunning = true;

    // Trigger immediate first tick
    this.tick();

    this.timer = setInterval(() => {
      this.tick();
    }, this.intervalMs);

    console.log(`[Simulator] Started simulation in '${this.mode}' mode for ${this.deviceId}`);
    return this.getStatus();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('[Simulator] Stopped simulation');
    return this.getStatus();
  }

  setScenario(scenario) {
    if (scenario === 'heatwave') {
      this.mode = 'heatwave';
      this.phase = 'heating';
      this.currentTemp = Math.max(this.currentTemp, 31.0);
    } else if (scenario === 'cooldown') {
      this.mode = 'cooldown';
      this.phase = 'cooling';
    } else {
      this.mode = 'auto';
    }
    return this.getStatus();
  }

  async tick() {
    if (!this.isRunning || !this.app) return;

    // Natural variation with smooth progression
    const tempJitter = (Math.random() - 0.5) * 0.3;
    const humJitter = (Math.random() - 0.5) * 0.8;

    if (this.mode === 'heatwave') {
      // Rapidly heat up into HIGH warning (36°C - 41°C)
      if (this.currentTemp < 39.5) {
        this.currentTemp += 0.8 + Math.random() * 0.5;
        this.currentHumidity = Math.max(38, this.currentHumidity - 0.6);
      } else {
        this.currentTemp = 39.5 + tempJitter;
      }
    } else if (this.mode === 'cooldown') {
      // Ventilating / AC turned on: cool down into NORMAL (< 30°C)
      if (this.currentTemp > 26.5) {
        this.currentTemp -= 1.0 + Math.random() * 0.5;
        this.currentHumidity = Math.min(65, this.currentHumidity + 0.5);
      } else {
        this.currentTemp = 26.5 + tempJitter;
      }
    } else {
      // Auto cycle: Car parked in sun heating up, then ventilating
      if (this.phase === 'heating') {
        this.currentTemp += 0.55 + Math.random() * 0.2;
        this.currentHumidity = Math.max(40, this.currentHumidity - 0.4);
        if (this.currentTemp >= 39.5) {
          this.phase = 'cooling'; // Cabin ventilated!
        }
      } else {
        this.currentTemp -= 0.65 + Math.random() * 0.2;
        this.currentHumidity = Math.min(62, this.currentHumidity + 0.4);
        if (this.currentTemp <= 26.5) {
          this.phase = 'heating'; // Sun heats cabin again
        }
      }
    }

    const payload = {
      device_id: this.deviceId,
      temperature: parseFloat(this.currentTemp.toFixed(1)),
      humidity: parseFloat(this.currentHumidity.toFixed(1)),
      is_simulated: true,
    };

    // Invoke postSensorData via synthetic req / res
    const syntheticReq = {
      body: payload,
      app: this.app,
      headers: {},
      query: {},
    };

    const syntheticRes = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(data) {
        // Broadcast simulator event to clients
        const io = syntheticReq.app.get('io');
        if (io) {
          io.emit('simulator_status', {
            active: true,
            currentTemp: payload.temperature,
            currentHumidity: payload.humidity,
          });
        }
        return data;
      },
    };

    try {
      await postSensorData(syntheticReq, syntheticRes);
    } catch (err) {
      console.error('[Simulator Tick Error]:', err.message);
    }
  }
}

module.exports = new SimulatorService();
