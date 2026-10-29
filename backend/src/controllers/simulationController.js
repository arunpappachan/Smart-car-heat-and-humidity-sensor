const simulator = require('../services/simulator');

const isSimulationAllowed = () => {
  // Enabled by default in dev/test, or if explicitly enabled via env
  if (process.env.NODE_ENV !== 'production') return true;
  return process.env.ENABLE_SIMULATION === 'true';
};

const getSimulationStatus = (req, res) => {
  if (!isSimulationAllowed()) {
    return res.status(403).json({
      success: false,
      error: 'Simulation mode is disabled in this environment.',
    });
  }
  return res.json({
    success: true,
    simulation: simulator.getStatus(),
  });
};

const startSimulation = (req, res) => {
  if (!isSimulationAllowed()) {
    return res.status(403).json({
      success: false,
      error: 'Simulation mode is disabled in this environment.',
    });
  }
  const { mode = 'auto', device_id = 'CAR_001' } = req.body || {};
  const status = simulator.start(mode, device_id);
  return res.json({
    success: true,
    message: `Simulator started in ${mode} mode for ${device_id}`,
    simulation: status,
  });
};

const stopSimulation = (req, res) => {
  if (!isSimulationAllowed()) {
    return res.status(403).json({
      success: false,
      error: 'Simulation mode is disabled in this environment.',
    });
  }
  const status = simulator.stop();
  return res.json({
    success: true,
    message: 'Simulator stopped',
    simulation: status,
  });
};

const setScenario = (req, res) => {
  if (!isSimulationAllowed()) {
    return res.status(403).json({
      success: false,
      error: 'Simulation mode is disabled in this environment.',
    });
  }
  const { scenario } = req.body || {};
  if (!['auto', 'heatwave', 'cooldown'].includes(scenario)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid scenario. Must be "auto", "heatwave", or "cooldown".',
    });
  }
  const status = simulator.setScenario(scenario);
  return res.json({
    success: true,
    message: `Simulation scenario set to ${scenario}`,
    simulation: status,
  });
};

module.exports = {
  getSimulationStatus,
  startSimulation,
  stopSimulation,
  setScenario,
  isSimulationAllowed,
};
