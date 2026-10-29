import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import StatusIndicator from '../components/StatusIndicator';
import TemperatureCard from '../components/TemperatureCard';
import HumidityCard from '../components/HumidityCard';
import LEDIndicator from '../components/LEDIndicator';
import TemperatureChart from '../components/TemperatureChart';
import HumidityChart from '../components/HumidityChart';
import SensorHistory from '../components/SensorHistory';
import AlertHistory from '../components/AlertHistory';
import SimulationModal from '../components/SimulationModal';
import {
  getLatestReading,
  getSensorHistory,
  getSensorStats,
  getAlerts,
  initSocketConnection,
} from '../services/api';

export default function Dashboard() {
  const [deviceId] = useState('CAR_001');
  const [latest, setLatest] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [stats, setStats] = useState(null);
  const [historyReadings, setHistoryReadings] = useState([]);
  const [chartReadings, setChartReadings] = useState([]);
  const [chartRange, setChartRange] = useState('1h');
  const [alerts, setAlerts] = useState([]);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Table pagination and filtering
  const [tablePage, setTablePage] = useState(1);
  const [tableLimit] = useState(10);
  const [tableTotal, setTableTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Load latest telemetry & stats
  const fetchTelemetry = useCallback(async () => {
    setIsLoading(true);
    try {
      const [latestRes, statsRes, alertsRes] = await Promise.all([
        getLatestReading(deviceId),
        getSensorStats(deviceId, '24h'),
        getAlerts({ deviceId, limit: 15 }),
      ]);

      if (latestRes.success) {
        setLatest(latestRes.latest);
        setIsOnline(latestRes.is_online);
      }

      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      if (alertsRes.success) {
        setAlerts(alertsRes.alerts);
      }
    } catch (err) {
      console.error('[Telemetry fetch error]:', err);
    } finally {
      setIsLoading(false);
    }
  }, [deviceId]);

  // Load chart data
  const fetchChartData = useCallback(async (range) => {
    try {
      const res = await getSensorHistory({
        deviceId,
        range,
        limit: 120,
      });
      if (res.success) {
        setChartReadings(res.readings);
      }
    } catch (err) {
      console.error('[Chart fetch error]:', err);
    }
  }, [deviceId]);

  // Load table data
  const fetchTableData = useCallback(async (page, filter) => {
    try {
      const offset = (page - 1) * tableLimit;
      const res = await getSensorHistory({
        deviceId,
        range: 'all',
        limit: tableLimit,
        offset,
        status: filter === 'ALL' ? undefined : filter,
      });
      if (res.success) {
        setHistoryReadings(res.readings);
        setTableTotal(res.total);
      }
    } catch (err) {
      console.error('[Table fetch error]:', err);
    }
  }, [deviceId, tableLimit]);

  // Initial load
  useEffect(() => {
    fetchTelemetry();
    fetchChartData(chartRange);
    fetchTableData(tablePage, statusFilter);
  }, [fetchTelemetry, fetchChartData, fetchTableData, chartRange, tablePage, statusFilter]);

  // Real-time WebSocket event listeners
  useEffect(() => {
    const socket = initSocketConnection();

    // Ingest live sensor telemetry
    const handleSensorData = (data) => {
      setLatest(data);
      setIsOnline(true);

      // Append to charts state
      setChartReadings((prev) => [data, ...prev.slice(0, 150)]);

      // Prepend to history table if on page 1 and matches filter
      setHistoryReadings((prev) => [data, ...prev.slice(0, tableLimit - 1)]);
      setTableTotal((prev) => prev + 1);

      // Dynamically update session stats
      setStats((prev) => {
        if (!prev) return null;
        const newTemp = parseFloat(data.temperature);
        const newHum = parseFloat(data.humidity);
        return {
          ...prev,
          min_temperature: Math.min(parseFloat(prev.min_temperature || newTemp), newTemp).toFixed(1),
          max_temperature: Math.max(parseFloat(prev.max_temperature || newTemp), newTemp).toFixed(1),
          min_humidity: Math.min(parseFloat(prev.min_humidity || newHum), newHum).toFixed(1),
          max_humidity: Math.max(parseFloat(prev.max_humidity || newHum), newHum).toFixed(1),
        };
      });
    };

    // Ingest new warning / critical alert
    const handleNewAlert = (alert) => {
      setAlerts((prev) => [alert, ...prev.slice(0, 20)]);
    };

    // Ingest device connection watchdog update
    const handleDeviceStatus = (statusUpdate) => {
      if (statusUpdate.device_id === deviceId) {
        setIsOnline(statusUpdate.is_online);
      }
    };

    socket.on('sensor_data', handleSensorData);
    socket.on('new_alert', handleNewAlert);
    socket.on('device_status', handleDeviceStatus);

    return () => {
      socket.off('sensor_data', handleSensorData);
      socket.off('new_alert', handleNewAlert);
      socket.off('device_status', handleDeviceStatus);
    };
  }, [deviceId, tableLimit]);

  // Periodic safety refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  const currentTemp = latest ? parseFloat(latest.temperature) : 0;
  const currentHum = latest ? parseFloat(latest.humidity) : 0;
  const currentStatus = latest ? latest.status : 'NORMAL';

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Dashboard Top Header */}
      <Header
        deviceId={deviceId}
        isOnline={isOnline}
        lastUpdated={latest ? latest.recorded_at : null}
        isSimulated={latest ? latest.is_simulated : false}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onRefresh={() => {
          fetchTelemetry();
          fetchChartData(chartRange);
          fetchTableData(tablePage, statusFilter);
        }}
        isLoading={isLoading}
      />

      <main className="space-y-6">
        {/* Safety Condition Banner */}
        <StatusIndicator
          status={currentStatus}
          temperature={currentTemp}
          isOnline={isOnline}
        />

        {/* Core Metric & Hardware Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TemperatureCard
            temperature={currentTemp}
            status={currentStatus}
            isOnline={isOnline}
            minTemp={stats?.min_temperature}
            maxTemp={stats?.max_temperature}
            avgTemp={stats?.avg_temperature}
          />

          <HumidityCard
            humidity={currentHum}
            isOnline={isOnline}
            minHum={stats?.min_humidity}
            maxHum={stats?.max_humidity}
            avgHum={stats?.avg_humidity}
          />

          <LEDIndicator
            status={currentStatus}
            temperature={currentTemp}
            isOnline={isOnline}
          />
        </div>

        {/* Telemetry Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TemperatureChart
            data={chartReadings}
            currentRange={chartRange}
            onRangeChange={(range) => {
              setChartRange(range);
              fetchChartData(range);
            }}
          />

          <HumidityChart data={chartReadings} />
        </div>

        {/* Historical Logs & Alert Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SensorHistory
              readings={historyReadings}
              total={tableTotal}
              page={tablePage}
              limit={tableLimit}
              onPageChange={(p) => setTablePage(p)}
              statusFilter={statusFilter}
              onStatusFilterChange={(s) => {
                setStatusFilter(s);
                setTablePage(1);
              }}
            />
          </div>

          <div className="lg:col-span-1">
            <AlertHistory alerts={alerts} />
          </div>
        </div>
      </main>

      {/* Simulator Modal Drawer */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
      />
    </div>
  );
}
