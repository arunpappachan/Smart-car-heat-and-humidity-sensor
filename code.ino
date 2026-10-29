#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <DHT.h>

// ==============================================================================
// 1. WIFI HOTSPOT CONFIGURATION
// ==============================================================================
const char* ssid     = "iQOO Neo9 Pro";
const char* password = "12345678";

// ==============================================================================
// 2. RENDER CLOUD BACKEND CONFIGURATION
// Replace YOUR_RENDER_APP with your actual Render service name:
// Example: https://smart-car-backend.onrender.com/api/sensor-data
// ==============================================================================
const char* serverURL   = "https://YOUR_BACKEND_APP.onrender.com/api/sensor-data";
const char* deviceApiKey = "smart-car-secret-key-2026";
const char* deviceId    = "CAR_001";

// ==============================================================================
// 3. SENSOR AND LED PIN ASSIGNMENTS
// ==============================================================================
#define DHTPIN 4
#define DHTTYPE DHT22

#define RED_LED    26  // High Temp Warning (>= 35°C)
#define YELLOW_LED 25  // Caution (30°C - 34.9°C)
#define GREEN_LED  27  // Normal (< 30°C)

DHT dht(DHTPIN, DHTTYPE);
WebServer server(80);

// ==============================================================================
// 4. GLOBAL TELEMETRY VARIABLES
// ==============================================================================
float temperature = 0.0;
float humidity    = 0.0;
bool sensorValid  = false;
String status     = "NORMAL";

unsigned long previousMillis     = 0;
const unsigned long interval     = 5000; // Ingest every 5 seconds

unsigned long lastWifiCheck      = 0;
const unsigned long wifiInterval = 10000;

int lastHttpCode = 0;

// ==============================================================================
// 5. LOCAL ESP32 BACKUP WEBPAGE
// ==============================================================================
const char webpage[] PROGMEM = R"rawliteral(
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Smart Car Monitoring System | ESP32</title>
<style>
* { box-sizing: border-box; }
body {
    font-family: Arial, sans-serif;
    background: #0b101b;
    color: white;
    margin: 0;
    padding: 20px;
    text-align: center;
}
.container { max-width: 650px; margin: auto; }
h1 { color: #38bdf8; margin-bottom: 5px; }
.subtitle { color: #94a3b8; margin-bottom: 25px; }
.card {
    background: #131c2e;
    border: 1px solid #1f293d;
    padding: 20px;
    margin: 15px 0;
    border-radius: 14px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
}
.label { color: #94a3b8; font-size: 16px; text-transform: uppercase; font-weight: bold; }
.value { font-size: 42px; font-weight: bold; color: #38bdf8; margin-top: 8px; }
.status {
    padding: 16px;
    border-radius: 10px;
    font-size: 20px;
    font-weight: bold;
    background: #1e293b;
    margin-top: 10px;
}
.red { background: #ef4444; color: white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
.yellow { background: #f59e0b; color: black; box-shadow: 0 0 15px rgba(245, 158, 11, 0.4); }
.green { background: #10b981; color: white; box-shadow: 0 0 15px rgba(16, 185, 129, 0.4); }
.error { background: #64748b; }
.led-container {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 15px;
}
.led {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #1e293b;
    border: 2px solid #475569;
    margin: 0 auto;
}
.led-red.active { background: #ef4444; box-shadow: 0 0 20px #ef4444; }
.led-yellow.active { background: #f59e0b; box-shadow: 0 0 20px #f59e0b; }
.led-green.active { background: #10b981; box-shadow: 0 0 20px #10b981; }
.cloud-info {
    font-size: 12px;
    color: #64748b;
    margin-top: 15px;
    text-align: left;
    background: #0e1524;
    padding: 12px;
    border-radius: 8px;
}
</style>
</head>
<body>
<div class="container">
<h1>SMART CAR MONITOR</h1>
<p class="subtitle">Real-Time ESP32 IoT Cabin Temperature & Humidity System</p>

<div class="card">
    <div class="label">Temperature</div>
    <div class="value" id="temp">-- °C</div>
</div>

<div class="card">
    <div class="label">Humidity</div>
    <div class="value" id="humidity">-- %</div>
</div>

<div class="card">
    <div class="label">Cabin Safety Status</div>
    <div class="status" id="status">Connecting...</div>
    <p id="message" style="margin-top: 10px; font-size: 15px; color: #cbd5e1;"></p>
</div>

<div class="card">
    <div class="label">Physical LED Synchronization</div>
    <div class="led-container">
        <div>
            <div class="led led-green" id="green"></div>
            <p style="font-size: 12px; margin-top: 6px;">Normal (&lt;30°C)</p>
        </div>
        <div>
            <div class="led led-yellow" id="yellow"></div>
            <p style="font-size: 12px; margin-top: 6px;">Caution (30-35°C)</p>
        </div>
        <div>
            <div class="led led-red" id="red"></div>
            <p style="font-size: 12px; margin-top: 6px;">High (&ge;35°C)</p>
        </div>
    </div>
</div>

<div class="cloud-info" id="cloud-info">
    <div><strong>Cloud Target:</strong> Connecting to Render...</div>
    <div><strong>Device ID:</strong> CAR_001</div>
</div>
</div>

<script>
async function updateData() {
    try {
        const res = await fetch('/data');
        const data = await res.json();
        
        document.getElementById("red").classList.remove("active");
        document.getElementById("yellow").classList.remove("active");
        document.getElementById("green").classList.remove("active");

        if (!data.valid) {
            document.getElementById("temp").textContent = "-- °C";
            document.getElementById("humidity").textContent = "-- %";
            document.getElementById("status").textContent = "SENSOR ERROR";
            document.getElementById("status").className = "status error";
            document.getElementById("message").textContent = "Check DHT22 wiring & pull-up resistor.";
            return;
        }

        document.getElementById("temp").textContent = data.temperature.toFixed(1) + " °C";
        document.getElementById("humidity").textContent = data.humidity.toFixed(1) + " %";

        if (data.status === "HIGH") {
            document.getElementById("status").textContent = "HIGH TEMPERATURE DETECTED";
            document.getElementById("status").className = "status red";
            document.getElementById("message").textContent = "Ventilate the vehicle and use the air conditioner to cool the cabin.";
            document.getElementById("red").classList.add("active");
        } else if (data.status === "WARNING") {
            document.getElementById("status").textContent = "WARNING: CABIN HEATING UP";
            document.getElementById("status").className = "status yellow";
            document.getElementById("message").textContent = "Cabin temperature is rising in direct sunlight.";
            document.getElementById("yellow").classList.add("active");
        } else {
            document.getElementById("status").textContent = "NORMAL CONDITIONS";
            document.getElementById("status").className = "status green";
            document.getElementById("message").textContent = "Cabin temperature is within safe ambient range.";
            document.getElementById("green").classList.add("active");
        }
    } catch(e) {}
}
setInterval(updateData, 2000);
updateData();
</script>
</body>
</html>
)rawliteral";

// ==============================================================================
// 6. TRANSMIT TELEMETRY TO RENDER CLOUD VIA HTTPS POST
// ==============================================================================
void sendDataToRender() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] Wi-Fi disconnected. Cannot send to Render.");
    return;
  }

  // Check if target URL placeholder has been replaced
  if (String(serverURL).indexOf("YOUR_BACKEND_APP") >= 0) {
    Serial.println("[Render Config] Please replace YOUR_BACKEND_APP with your actual Render URL in serverURL!");
    return;
  }

  HTTPClient http;
  WiFiClient regularClient;
  WiFiClientSecure secureClient;

  bool isHttps = String(serverURL).startsWith("https://");

  if (isHttps) {
    // Render uses HTTPS; setInsecure avoids certificate bundle overhead on ESP32
    secureClient.setInsecure();
    http.begin(secureClient, serverURL);
  } else {
    http.begin(regularClient, serverURL);
  }

  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", deviceApiKey);
  http.setTimeout(8000); // 8 second timeout to account for free-tier wakeups

  // JSON Payload: {"device_id":"CAR_001","temperature":38.5,"humidity":62.5,"status":"HIGH"}
  String payload = "{";
  payload += "\"device_id\":\"" + String(deviceId) + "\",";
  payload += "\"temperature\":" + String(temperature, 1) + ",";
  payload += "\"humidity\":" + String(humidity, 1) + ",";
  payload += "\"status\":\"" + status + "\"";
  payload += "}";

  int httpCode = http.POST(payload);
  lastHttpCode = httpCode;

  if (httpCode > 0) {
    if (httpCode == HTTP_CODE_OK || httpCode == HTTP_CODE_CREATED) {
      Serial.printf("[Cloud POST Success] Telemetry recorded in Render PostgreSQL! (Code %d)\n", httpCode);
    } else {
      Serial.printf("[Cloud POST Response] Code %d\n", httpCode);
    }
  } else {
    Serial.printf("[Cloud POST Error] %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

// ==============================================================================
// 7. READ SENSOR & UPDATE HARDWARE LEDS
// ==============================================================================
void readSensor() {
  float newTemp = dht.readTemperature();
  float newHum  = dht.readHumidity();

  if (isnan(newTemp) || isnan(newHum)) {
    Serial.println("[Sensor Error] Failed to read from DHT22! Check GPIO 4 & pull-up resistor.");
    sensorValid = false;
    status = "ERROR";

    // Flash Yellow LED to indicate hardware issue
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(RED_LED, LOW);
    digitalWrite(YELLOW_LED, !digitalRead(YELLOW_LED));
    return;
  }

  sensorValid = true;
  temperature = newTemp;
  humidity    = newHum;

  // Authoritative Temperature Evaluation
  if (temperature >= 35.0) {
    status = "HIGH";
    digitalWrite(RED_LED, HIGH);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(GREEN_LED, LOW);
  } else if (temperature >= 30.0) {
    status = "WARNING";
    digitalWrite(RED_LED, LOW);
    digitalWrite(YELLOW_LED, HIGH);
    digitalWrite(GREEN_LED, LOW);
  } else {
    status = "NORMAL";
    digitalWrite(RED_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(GREEN_LED, HIGH);
  }

  Serial.println("----------------------------------------------");
  Serial.printf("[Sensor Reading] Temp: %.1f °C | Humidity: %.1f %% | Status: %s\n",
                temperature, humidity, status.c_str());

  // Transmit telemetry to Render Cloud
  sendDataToRender();
}

// ==============================================================================
// 8. WEBPAGE ROUTE HANDLERS
// ==============================================================================
void handleRoot() {
  server.send_P(200, "text/html", webpage);
}

void handleData() {
  String json = "{";
  json += "\"temperature\":" + String(temperature, 1) + ",";
  json += "\"humidity\":" + String(humidity, 1) + ",";
  json += "\"status\":\"" + status + "\",";
  json += "\"valid\":" + String(sensorValid ? "true" : "false") + ",";
  json += "\"lastHttpCode\":" + String(lastHttpCode);
  json += "}";
  server.send(200, "application/json", json);
}

// ==============================================================================
// 9. WIFI CONNECTION & AUTO-RECONNECT
// ==============================================================================
void connectWiFi() {
  Serial.print("[WiFi] Connecting to: ");
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
    Serial.println("\n[WiFi] Connected Successfully!");
    Serial.print("[WiFi] ESP32 Local IP: http://");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n[WiFi] Initial connection failed. Will keep retrying...");
  }
}

void checkWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[WiFi] Reconnecting...");
    WiFi.disconnect();
    WiFi.reconnect();
  }
}

// ==============================================================================
// 10. ARDUINO SETUP
// ==============================================================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n========================================================");
  Serial.println("   SMART CAR CABIN HEAT AND HUMIDITY DETECTOR (ESP32)");
  Serial.println("========================================================");

  pinMode(RED_LED, OUTPUT);
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);

  // Self-test LEDs
  digitalWrite(GREEN_LED, HIGH);
  delay(200);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(YELLOW_LED, HIGH);
  delay(200);
  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(RED_LED, HIGH);
  delay(200);
  digitalWrite(RED_LED, LOW);

  dht.begin();
  connectWiFi();

  // Local Web Server Routes
  server.on("/", HTTP_GET, handleRoot);
  server.on("/data", HTTP_GET, handleData);
  server.begin();

  Serial.println("[WebServer] Local diagnostic server active on port 80.");

  readSensor();
  previousMillis = millis();
}

// ==============================================================================
// 11. ARDUINO MAIN LOOP
// ==============================================================================
void loop() {
  server.handleClient();

  unsigned long currentMillis = millis();

  // Periodic Wi-Fi Check
  if (currentMillis - lastWifiCheck >= wifiInterval) {
    lastWifiCheck = currentMillis;
    checkWiFi();
  }

  // Periodic Sensor Reading & Cloud Ingestion (every 5s)
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    readSensor();
  }
}