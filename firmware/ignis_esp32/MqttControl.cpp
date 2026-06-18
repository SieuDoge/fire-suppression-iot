#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include "MqttControl.h"
#include "Config.h"
#include "NetworkConfig.h"
#include "Sensors.h"
#include "PanControl.h"
#include "TiltControl.h"
#include "Actuators.h"

// ===== GLOBAL CLIENTS =====
WiFiClient espClient;
PubSubClient client(espClient);

// ===== STATE TRACKING FOR DELTA PUBLISH =====
static float         lastPubPan         = -999.0f;
static int           lastPubTilt        = -999;
static bool          lastPubSensors[7]  = {false, false, false, false, false, false, false};
static bool          lastPubTiltSensor  = false;
static bool          lastPubPump        = false;
static float         lastPubTempAmbient = -999.0f;
static float         lastPubTempObject  = -999.0f;

static unsigned long lastHeartbeatMs    = 0;
static unsigned long lastMqttAttemptMs  = 0;
static unsigned long lastWifiAttemptMs  = 0;
static bool          wifiConnected      = false;

// ===== MQTT CALLBACK HANDLER =====
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print(F(">> [MQTT] Message arrived ["));
  Serial.print(topic);
  Serial.println(F("]"));

  // Đọc payload dưới dạng chuỗi
  char payloadStr[length + 1];
  memcpy(payloadStr, payload, length);
  payloadStr[length] = '\0';
  Serial.print(F(">> Payload: "));
  Serial.println(payloadStr);

  // Parse JSON nhận được
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, payloadStr);
  if (error) {
    Serial.print(F(">> [MQTT] JSON parsing failed: "));
    Serial.println(error.c_str());
    return;
  }

  // Xử lý các lệnh điều khiển từ backend
  if (doc.containsKey("action") && doc.containsKey("value")) {
    const char* action = doc["action"];
    const char* value = doc["value"];
    bool turnOn = (strcmp(value, "on") == 0);

    Serial.print(F(">> [MQTT] Action: "));
    Serial.print(action);
    Serial.print(F(", Value: "));
    Serial.println(value);

    extern bool fullAuto;
    extern bool panAuto;

    if (strcmp(action, "fullAuto") == 0) {
      fullAuto = turnOn;
      if (fullAuto) {
        panAuto = false;
      } else {
        setAlarm(false); // Tắt bơm và còi khi tắt chế độ tự động
      }
      Serial.print(F(">> [MQTT] FULL AUTO: "));
      Serial.println(fullAuto ? F("ON") : F("OFF"));
    } 
    else if (strcmp(action, "panAuto") == 0) {
      panAuto = turnOn;
      if (panAuto) {
        fullAuto = false;
      }
      Serial.print(F(">> [MQTT] PAN AUTO: "));
      Serial.println(panAuto ? F("ON") : F("OFF"));
    } 
    else if (strcmp(action, "pump") == 0) {
      if (fullAuto) {
        Serial.println(F(">> [MQTT] PUMP ignored — AUTO mode active"));
      } else {
        setRelay(turnOn);
        Serial.print(F(">> [MQTT] PUMP: "));
        Serial.println(turnOn ? F("ON") : F("OFF"));
      }
    } 
    else if (strcmp(action, "buzzer") == 0) {
      if (fullAuto) {
        Serial.println(F(">> [MQTT] BUZZER ignored — AUTO mode active"));
      } else {
        setBuzzer(turnOn);
        Serial.print(F(">> [MQTT] BUZZER: "));
        Serial.println(turnOn ? F("ON") : F("OFF"));
      }
    }
    else if (strcmp(action, "servo") == 0) {
      if (fullAuto) {
        Serial.println(F(">> [MQTT] SERVO ignored — AUTO mode active. Switch to MANUAL first."));
      } else {
        // Parse "pan:XXX,tilt:YYY" format
        int pan = -1, tilt = -1;
        const char* pPan = strstr(value, "pan:");
        const char* pTilt = strstr(value, "tilt:");
        if (pPan) pan = atoi(pPan + 4);
        if (pTilt) tilt = atoi(pTilt + 5);

        if (pan >= 0 && pan <= 180) {
          servoPan.write(pan);
          lastPanAngle = (float)pan;
          Serial.print(F(">> [MQTT] SERVO PAN → "));
          Serial.println(pan);
        }
        if (tilt >= 0 && tilt <= 150) {
          servoTilt.write(tilt);
          lastTiltAngle = tilt;
          Serial.print(F(">> [MQTT] SERVO TILT → "));
          Serial.println(tilt);
        }
      }
    }
    
    // Gửi phản hồi cập nhật trạng thái mới lập tức
    publishState(true);
  }
}

// ===== INIT NETWORK =====
void initNetwork() {
  // Load config từ NVS (hoặc dùng default từ Config.h)
  loadNetConfig();

  Serial.println(F("\n>> [Network] Initializing WiFi..."));
  WiFi.mode(WIFI_STA);
  WiFi.begin(netCfg.wifiSSID, netCfg.wifiPassword);
  
  // Thiết lập MQTT client
  client.setServer(netCfg.mqttServer, netCfg.mqttPort);
  client.setCallback(mqttCallback);
  client.setBufferSize(512);
  
  lastHeartbeatMs = millis();
  lastWifiAttemptMs = millis();
}

// ===== HANDLE NETWORK (Non-blocking Reconnect) =====
void handleNetwork() {
  unsigned long now = millis();

  // 1. Kiểm tra trạng thái WiFi
  if (WiFi.status() == WL_CONNECTED) {
    if (!wifiConnected) {
      Serial.print(F(">> [WiFi] Connected. IP: "));
      Serial.println(WiFi.localIP());
      wifiConnected = true;
    }
  } else {
    if (wifiConnected) {
      Serial.println(F(">> [WiFi] Lost connection. Reconnecting..."));
      wifiConnected = false;
    }
    
    // Thử kết nối lại sau mỗi 10 giây nếu mất kết nối
    if (now - lastWifiAttemptMs > 10000) {
      lastWifiAttemptMs = now;
      Serial.println(F(">> [WiFi] Attempting WiFi reconnection..."));
      WiFi.disconnect();
      WiFi.begin(netCfg.wifiSSID, netCfg.wifiPassword);
    }
    return; // Chưa có WiFi thì không xử lý tiếp MQTT
  }

  // 2. Kiểm tra kết nối MQTT
  if (!client.connected()) {
    if (now - lastMqttAttemptMs > 5000) {
      lastMqttAttemptMs = now;
      Serial.print(F(">> [MQTT] Attempting connection to "));
      Serial.print(MQTT_SERVER);
      Serial.println(F("..."));
      
      if (client.connect(MQTT_CLIENT_ID)) {
        Serial.println(F(">> [MQTT] Connected successfully!"));
        bool sub = client.subscribe(MQTT_TOPIC_CONTROL);
        if(sub) Serial.println(F(">> [MQTT] Subscribed to fire/control"));
        else Serial.println(F(">> [MQTT] Subscribe FAILED!"));
        delay(100);
        publishState(true); // Gửi bản tin đồng bộ ngay khi kết nối
      } else {
        Serial.print(F(">> [MQTT] Failed, rc="));
        Serial.print(client.state());
        Serial.println(F(" (Try again in 5s)"));
      }
    }
  } else {
    client.loop();
    // 3. Heartbeat & Delta Publish check
    publishState(false);
  }
}

// ===== PUBLISH STATE =====
void publishState(bool force) {
  unsigned long now = millis();
  
  // Đọc các giá trị hiện tại của hệ thống
  float currentPan          = lastPanAngle;
  int   currentTilt         = lastTiltAngle;
  bool  currentPump         = isRelayOn();
  float currentTempAmbient  = readMLXAmbient();
  float currentTempObject   = readMLXObject();

  // Đọc trạng thái 7 cảm biến Pan cố định
  int rawSensors[NUM_SENSORS];
  bool currentSensors[NUM_SENSORS];
  bool sensorChanged = false;
  for (int i = 0; i < NUM_SENSORS; i++) {
    rawSensors[i] = analogRead(sensorPins[i]);
    currentSensors[i] = hasFire(i, rawSensors[i]);
    if (currentSensors[i] != lastPubSensors[i]) {
      sensorChanged = true;
    }
  }

  // Đọc trạng thái cảm biến Tilt
  bool currentTiltSensor = (digitalRead(TILT_SENSOR_PIN) == LOW);

  // Kiểm tra sự thay đổi trạng thái (Delta check)
  bool stateChanged = false;

  if (force) {
    stateChanged = true;
  } else if (now - lastHeartbeatMs >= HEARTBEAT_INTERVAL) {
    stateChanged = true; // Heartbeat interval
  } else if (currentPump != lastPubPump) {
    stateChanged = true; // Trạng thái bơm thay đổi
  } else if (currentTiltSensor != lastPubTiltSensor) {
    stateChanged = true; // Trạng thái cảm biến tilt đổi
  } else if (sensorChanged) {
    stateChanged = true; // Bất kỳ cảm biến pan nào đổi trạng thái
  } else if (fabsf(currentPan - lastPubPan) > 1.5f) {
    stateChanged = true; // Góc Pan đổi > 1.5 độ
  } else if (abs(currentTilt - lastPubTilt) >= 5) {
    stateChanged = true; // Góc Tilt đổi >= 5 độ
  } else if (!isnan(currentTempAmbient) && !isnan(lastPubTempAmbient) && fabsf(currentTempAmbient - lastPubTempAmbient) > 0.5f) {
    stateChanged = true; // Nhiệt độ môi trường đổi > 0.5 °C
  } else if (!isnan(currentTempObject) && !isnan(lastPubTempObject) && fabsf(currentTempObject - lastPubTempObject) > 1.0f) {
    stateChanged = true; // Nhiệt độ vật thể đổi > 1.0 °C
  }

  if (!stateChanged) return;

  // Tạo JSON payload
  StaticJsonDocument<256> doc;
  doc["pan"] = round(currentPan * 10.0) / 10.0; // làm tròn 1 chữ số thập phân
  doc["tilt"] = currentTilt;
  
  JsonArray sensorsArray = doc.createNestedArray("sensors");
  for (int i = 0; i < NUM_SENSORS; i++) {
    sensorsArray.add(currentSensors[i] ? 1 : 0);
  }

  doc["tilt_sensor"] = currentTiltSensor ? 1 : 0;
  doc["pump"] = currentPump;
  doc["temp_ambient"] = isnan(currentTempAmbient) ? 0.0 : round(currentTempAmbient * 10.0) / 10.0;
  doc["temp_object"] = isnan(currentTempObject) ? 0.0 : round(currentTempObject * 10.0) / 10.0;

  char buffer[256];
  serializeJson(doc, buffer);

  // Publish lên MQTT topic
  if (client.publish(MQTT_TOPIC_STATUS, buffer)) {
    lastHeartbeatMs = now; // Reset heartbeat timer

    // Cập nhật lại cache trạng thái đã publish
    lastPubPan = currentPan;
    lastPubTilt = currentTilt;
    for (int i = 0; i < NUM_SENSORS; i++) lastPubSensors[i] = currentSensors[i];
    lastPubTiltSensor = currentTiltSensor;
    lastPubPump = currentPump;
    lastPubTempAmbient = currentTempAmbient;
    lastPubTempObject = currentTempObject;
  } else {
    Serial.println(F(">> [MQTT] Publish failed!"));
  }
}
