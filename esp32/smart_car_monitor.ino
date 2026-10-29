/*
 * ==============================================================================
 * PROJECT: Smart Car Heat and Humidity Monitoring System Using ESP32
 * MCA IoT Mini Project
 * 
 * HARDWARE CONNECTIONS:
 * ------------------------------------------------------------------------------
 * Component          | ESP32 Pin   | Notes
 * -------------------|-------------|-------------------------------------------
 * DHT22 VCC (Pin 1)  | 3.3V        | Stable 3.3V supply from ESP32 board
 * DHT22 DATA (Pin 2) | GPIO 4      | *Note: Bare 4-pin DHT22 requires a 
 *                    |             |  4.7kΩ - 10kΩ pull-up resistor between 
 *                    |             |  DATA and 3.3V rail. Modules with 3 pins
 *                    |             |  usually have this built-in.
 * DHT22 NC (Pin 3)   | Not connected
 * DHT22 GND (Pin 4)  | GND         | Common ground rail
 * Red LED (Anode +)  | GPIO 26     | Via 220Ω series current-limiting resistor
 * Yellow LED (Anode+)| GPIO 25     | Via 220Ω series current-limiting resistor
 * Green LED (Anode +)| GPIO 27     | Via 220Ω series current-limiting resistor
 * All LED Cathodes(-)| GND         | Common ground rail
 * 
 * TEMPERATURE INDICATION THRESHOLDS:
 * - Below 30.0°C         : NORMAL  -> GREEN LED ON  (Yellow OFF, Red OFF)
 * - 30.0°C to < 35.0°C   : WARNING -> YELLOW LED ON (Green OFF, Red OFF)
 * - 35.0°C and above     : HIGH    -> RED LED ON    (Green OFF, Yellow OFF)
 * 
 * DISCLAIMER:
 * Educational monitoring prototype for academic MCA project.
 * Not an automotive-certified life safety system.
 * ==============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include "DHT.h"

// ------------------------------------------------------------------------------
// Hardware Pin Definitions
// ------------------------------------------------------------------------------
#define DHTPIN        4       // ESP32 GPIO 4 connected to DHT22 DATA
#define DHTTYPE       DHT22   // Sensor Model: DHT 22 (AM2302)

#define LED_RED       26      // High Temperature Warning LED
#define LED_YELLOW    25      // Temperature Caution / Warning LED
#define LED_GREEN     27      // Normal Temperature LED

// ------------------------------------------------------------------------------
// Wi-Fi Network Credentials (Configure for your local Wi-Fi router / mobile hotspot)
// ------------------------------------------------------------------------------
const char* ssid     = "iQOO Neo9 Pro";
const char* password = "12345678";

// ------------------------------------------------------------------------------
// Backend REST API Configuration (Live on Render Cloud)
// ------------------------------------------------------------------------------
const char* serverURL = "https://smart-car-backend.onrender.com/api/sensor-data";
const char* deviceApiKey = "smart-car-secret-key-2026";
const char* deviceId  = "CAR_001";

// ------------------------------------------------------------------------------
// Temperature Threshold Constants (°Celsius)
// ------------------------------------------------------------------------------
const float TEMP_NORMAL_MAX = 30.0; // Below this is NORMAL (Green)
const float TEMP_HIGH_MIN   = 35.0; // At or above this is HIGH ALERT (Red)

// ------------------------------------------------------------------------------
// Global Instances & State Variables
// ------------------------------------------------------------------------------
DHT dht(DHTPIN, DHTTYPE);
WebServer server(80); // Local web server on port 80

// Non-blocking timer variables
unsigned long previousMillis = 0;
const unsigned long SENSOR_INTERVAL = 5000; // 5000 milliseconds = 5 seconds

unsigned long lastWifiCheckMillis = 0;
const unsigned long WIFI_CHECK_INTERVAL = 10000; // Check Wi-Fi every 10s

// Live Telemetry Storage
float currentTemp = 0.0;
float currentHumidity = 0.0;
String currentStatus = "NORMAL";
int lastHttpCode = 0;
unsigned long totalReadingsCount = 0;
unsigned long successfulPostsCount = 0;
bool sensorHealthy = false;

// ------------------------------------------------------------------------------
// Function Prototypes
// ------------------------------------------------------------------------------
void setupWiFi();
void checkWiFiConnection();
void readSensorAndProcess();
void updateLEDs(String status);
void sendDataToBackend();
void handleRootWebPage();
void handleJsonData();
void handleNotFound();

// ==============================================================================
// Arduino Setup
// ==============================================================================
void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);
  delay(1000);

  Serial.println();
  Serial.println("==========================================================");
  Serial.println("   SMART CAR CABIN TEMPERATURE & HUMIDITY MONITOR");
  Serial.println("              MCA Mini Project - ESP32           ");
  Serial.println("==========================================================");

  // Configure LED pins as OUTPUT
  pinMode(LED_RED, OUTPUT);
  pinMode(LED_YELLOW, OUTPUT);
  pinMode(LED_GREEN, OUTPUT);

  // Initial LED self-test (Cycle Green -> Yellow -> Red -> Off)
  Serial.println("[Self-Test] Cycling status LEDs...");
  digitalWrite(LED_GREEN, HIGH);
  delay(300);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_YELLOW, HIGH);
  delay(300);
  digitalWrite(LED_YELLOW, LOW);
  digitalWrite(LED_RED, HIGH);
  delay(300);
  digitalWrite(LED_RED, LOW);

  // Initialize DHT22 Sensor
  Serial.println("[Sensor] Initializing DHT22 on GPIO 4...");
  dht.begin();

  // Connect to Local Wi-Fi
  setupWiFi();

  // Configure Local ESP32 Web Server Routes
  server.on("/", HTTP_GET, handleRootWebPage);
  server.on("/api/data", HTTP_GET, handleJsonData);
  server.onNotFound(handleNotFound);
  server.begin();
  Serial.println("[WebServer] Local monitoring portal active on port 80.");
  Serial.print("[WebServer] Open in browser: http://");
  Serial.println(WiFi.localIP());
  Serial.println("----------------------------------------------------------");
}

// ==============================================================================
// Arduino Main Loop (Non-blocking execution)
// ==============================================================================
void loop() {
  // Handle incoming HTTP client requests for the local webpage
  server.handleClient();

  unsigned long currentMillis = millis();

  // Periodic Wi-Fi Health Check & Auto-reconnect
  if (currentMillis - lastWifiCheckMillis >= WIFI_CHECK_INTERVAL) {
    lastWifiCheckMillis = currentMillis;
    checkWiFiConnection();
  }

  // Periodic Sensor Telemetry Loop (every 5 seconds)
  if (currentMillis - previousMillis >= SENSOR_INTERVAL) {
    previousMillis = currentMillis;
    readSensorAndProcess();
  }
}

// ==============================================================================
// Wi-Fi Connection Management with Auto-reconnection
// ==============================================================================
void setupWiFi() {
  Serial.println();
  Serial.print("[WiFi] Connecting to network: ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 25) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("[WiFi] Connection established successfully!");
    Serial.print("[WiFi] ESP32 Assigned IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] Signal Strength (RSSI): ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println();
    Serial.println("[WiFi] Warning: Failed to connect initially. Will retry in background...");
  }
}

void checkWiFiConnection() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Connection lost. Reconnecting...");
    WiFi.disconnect();
    WiFi.reconnect();
  }
}

// ==============================================================================
// Sensor Reading, Threshold Logic, and LED Control
// ==============================================================================
void readSensorAndProcess() {
  totalReadingsCount++;

  // Read temperature as Celsius (isFahrenheit = false)
  float t = dht.readTemperature();
  // Read relative humidity (%)
  float h = dht.readHumidity();

  // Validate sensor output
  if (isnan(t) || isnan(h)) {
    Serial.println("[Sensor Error] Failed to read from DHT22! Check wiring and pull-up resistor on GPIO 4.");
    sensorHealthy = false;
    
    // Warn via blinking Yellow LED
    digitalWrite(LED_GREEN, LOW);
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, !digitalRead(LED_YELLOW));
    return;
  }

  sensorHealthy = true;
  currentTemp = t;
  currentHumidity = h;

  // Determine Authoritative Temperature Status
  if (currentTemp < TEMP_NORMAL_MAX) {
    currentStatus = "NORMAL";
  } else if (currentTemp < TEMP_HIGH_MIN) {
    currentStatus = "WARNING";
  } else {
    currentStatus = "HIGH";
  }

  // Update hardware LEDs strictly: exactly one LED ON at a time
  updateLEDs(currentStatus);

  // Serial Monitor Log Output
  Serial.println("----------------------------------------------------------");
  Serial.printf("[Telemetry #%lu] Temp: %.1f °C | Humidity: %.1f %% | Status: %s\n", 
                totalReadingsCount, currentTemp, currentHumidity, currentStatus.c_str());

  if (currentStatus == "HIGH") {
    Serial.println("  >>> ALERT: HIGH CABIN TEMPERATURE DETECTED! <<<");
    Serial.println("  Recommendation: Ventilate cabin and run air conditioning.");
  } else if (currentStatus == "WARNING") {
    Serial.println("  >>> CAUTION: Temperature rising. Monitor vehicle interior. <<<");
  } else {
    Serial.println("  Cabin temperature is within normal ambient range.");
  }

  // Transmit reading to Node.js backend over HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
    sendDataToBackend();
  } else {
    Serial.println("[HTTP] Wi-Fi offline. Telemetry buffered locally.");
  }
}

// ==============================================================================
// LED Hardware Control (Mutually Exclusive)
// ==============================================================================
void updateLEDs(String status) {
  if (status == "HIGH") {
    // RED LED: High Temperature Alert (>= 35°C)
    digitalWrite(LED_RED, HIGH);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_GREEN, LOW);
  } else if (status == "WARNING") {
    // YELLOW LED: Temperature Warning (30°C - 34.9°C)
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, HIGH);
    digitalWrite(LED_GREEN, LOW);
  } else {
    // GREEN LED: Normal Temperature (< 30°C)
    digitalWrite(LED_RED, LOW);
    digitalWrite(LED_YELLOW, LOW);
    digitalWrite(LED_GREEN, HIGH);
  }
}

// ==============================================================================
// HTTP / HTTPS POST Telemetry Transmission to Backend (Local or Render Cloud)
// ==============================================================================
void sendDataToBackend() {
  HTTPClient http;
  WiFiClient regularClient;
  WiFiClientSecure secureClient;

  bool isHttps = String(serverURL).startsWith("https://");

  if (isHttps) {
    // For Render or cloud hosting: bypass root certificate validation for ease of deployment
    secureClient.setInsecure();
    http.begin(secureClient, serverURL);
  } else {
    // For local PC testing (http://192.168.x.x:3000/api/sensor-data)
    http.begin(regularClient, serverURL);
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", deviceApiKey);
  http.setTimeout(8000); // 8 second connection timeout for cloud wakeups

  // Build JSON Payload
  // Example: {"device_id":"CAR_001","temperature":38.5,"humidity":62.5,"status":"HIGH"}
  String jsonPayload = "{";
  jsonPayload += "\"device_id\":\"" + String(deviceId) + "\",";
  jsonPayload += "\"temperature\":" + String(currentTemp, 1) + ",";
  jsonPayload += "\"humidity\":" + String(currentHumidity, 1) + ",";
  jsonPayload += "\"status\":\"" + currentStatus + "\"";
  jsonPayload += "}";

  int httpResponseCode = http.POST(jsonPayload);
  lastHttpCode = httpResponseCode;

  if (httpResponseCode > 0) {
    if (httpResponseCode == HTTP_CODE_CREATED || httpResponseCode == HTTP_CODE_OK) {
      successfulPostsCount++;
      Serial.printf("[HTTP] Success (%d) -> Backend synchronized.\n", httpResponseCode);
    } else {
      Serial.printf("[HTTP] Server responded with code: %d\n", httpResponseCode);
      String response = http.getString();
      Serial.println("[HTTP Response] " + response);
    }
  } else {
    Serial.printf("[HTTP Error] POST failed, error: %s\n", http.errorToString(httpResponseCode).c_str());
    Serial.println("[Hint] Verify backend is running and YOUR_COMPUTER_IP matches PC's local IP.");
  }

  http.end();
}

// ==============================================================================
// Local ESP32 Web Server - Diagnostic Portal
// ==============================================================================
void handleRootWebPage() {
  String statusColor = "#10B981"; // Green
  if (currentStatus == "WARNING") statusColor = "#F59E0B"; // Yellow
  if (currentStatus == "HIGH")    statusColor = "#EF4444"; // Red

  String html = "<!DOCTYPE html><html lang='en'><head>";
  html += "<meta charset='UTF-8'><meta name='viewport' content='width=device-width,initial-scale=1.0'>";
  html += "<title>ESP32 Smart Car Monitor</title>";
  html += "<meta http-equiv='refresh' content='5'>"; // Auto refresh every 5s
  html += "<style>";
  html += "body{background:#0b101b;color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:20px;display:flex;justify-content:center;}";
  html += ".card{background:#131c2e;border:1px solid #1f293d;border-radius:16px;max-width:440px;width:100%;padding:24px;box-shadow:0 12px 30px rgba(0,0,0,0.5);}";
  html += ".header{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1f293d;padding-bottom:12px;margin-bottom:20px;}";
  html += ".title{font-size:18px;font-weight:700;color:#38bdf8;margin:0;}";
  html += ".badge{padding:4px 10px;border-radius:999px;font-size:12px;font-weight:bold;text-transform:uppercase;}";
  html += ".metric-box{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px;}";
  html += ".metric{background:#0e1524;border:1px solid #1e293b;border-radius:12px;padding:16px;text-align:center;}";
  html += ".metric-title{font-size:12px;color:#94a3b8;margin-bottom:6px;}";
  html += ".metric-value{font-size:32px;font-weight:800;}";
  html += ".led-row{display:flex;justify-content:space-around;background:#0e1524;border-radius:12px;padding:16px;margin-bottom:20px;}";
  html += ".led-item{text-align:center;font-size:11px;color:#94a3b8;}";
  html += ".led-circle{width:22px;height:22px;border-radius:50%;margin:0 auto 6px;opacity:0.25;box-shadow:none;}";
  html += ".led-green.active{background:#10b981;opacity:1;box-shadow:0 0 14px #10b981;}";
  html += ".led-yellow.active{background:#f59e0b;opacity:1;box-shadow:0 0 14px #f59e0b;}";
  html += ".led-red.active{background:#ef4444;opacity:1;box-shadow:0 0 14px #ef4444;}";
  html += ".info{font-size:12px;color:#64748b;line-height:1.6;}";
  html += ".disclaimer{margin-top:16px;padding:10px;background:#1e293b33;border-left:3px solid #38bdf8;font-size:11px;color:#94a3b8;}";
  html += "</style></head><body>";

  html += "<div class='card'>";
  html += "<div class='header'>";
  html += "<div><h2 class='title'>SMART CAR MONITOR</h2><small style='color:#64748b;'>Device ID: " + String(deviceId) + "</small></div>";
  html += "<span class='badge' style='background:" + statusColor + "22;color:" + statusColor + ";border:1px solid " + statusColor + ";'>" + currentStatus + "</span>";
  html += "</div>";

  html += "<div class='metric-box'>";
  html += "<div class='metric'>";
  html += "<div class='metric-title'>TEMPERATURE</div>";
  html += "<div class='metric-value' style='color:" + statusColor + ";'>" + String(currentTemp, 1) + "<span style='font-size:18px;'>°C</span></div>";
  html += "</div>";
  html += "<div class='metric'>";
  html += "<div class='metric-title'>HUMIDITY</div>";
  html += "<div class='metric-value' style='color:#38bdf8;'>" + String(currentHumidity, 1) + "<span style='font-size:18px;'>%</span></div>";
  html += "</div>";
  html += "</div>";

  // Virtual LEDs representation
  html += "<div class='led-row'>";
  html += "<div class='led-item'><div class='led-circle led-green " + String(currentStatus == "NORMAL" ? "active" : "") + "'></div>GREEN (<30°C)</div>";
  html += "<div class='led-item'><div class='led-circle led-yellow " + String(currentStatus == "WARNING" ? "active" : "") + "'></div>YELLOW (30-35°C)</div>";
  html += "<div class='led-item'><div class='led-circle led-red " + String(currentStatus == "HIGH" ? "active" : "") + "'></div>RED (>=35°C)</div>";
  html += "</div>";

  html += "<div class='info'>";
  html += "<div><strong>ESP32 IP:</strong> " + WiFi.localIP().toString() + "</div>";
  html += "<div><strong>Wi-Fi RSSI:</strong> " + String(WiFi.RSSI()) + " dBm</div>";
  html += "<div><strong>Backend Target:</strong> " + String(serverURL) + "</div>";
  html += "<div><strong>Last HTTP Code:</strong> " + String(lastHttpCode) + " (" + String(successfulPostsCount) + "/" + String(totalReadingsCount) + " delivered)</div>";
  html += "<div><strong>Uptime:</strong> " + String(millis() / 1000) + " seconds</div>";
  html += "</div>";

  html += "<div class='disclaimer'>Educational IoT prototype. Real-time telemetry automatically forwarded to Docker/PostgreSQL/React system.</div>";
  html += "</div></body></html>";

  server.send(200, "text/html", html);
}

// Return JSON format directly from ESP32
void handleJsonData() {
  String json = "{";
  json += "\"device_id\":\"" + String(deviceId) + "\",";
  json += "\"temperature\":" + String(currentTemp, 1) + ",";
  json += "\"humidity\":" + String(currentHumidity, 1) + ",";
  json += "\"status\":\"" + currentStatus + "\",";
  json += "\"uptime_seconds\":" + String(millis() / 1000) + ",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\"";
  json += "}";

  server.send(200, "application/json", json);
}

void handleNotFound() {
  server.send(404, "application/json", "{\"error\":\"Not found\"}");
}
