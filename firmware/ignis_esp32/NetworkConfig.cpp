#include "NetworkConfig.h"
#include "Config.h"
#include <Preferences.h>

NetConfig netCfg;
static Preferences prefs;

void loadNetConfig() {
  prefs.begin("ignis_net", true);  // read-only

  // Load WiFi — fallback to Config.h defaults
  String ssid = prefs.getString("wifi_ssid", WIFI_SSID);
  String pass = prefs.getString("wifi_pass", WIFI_PASSWORD);
  String mqtt = prefs.getString("mqtt_srv", MQTT_SERVER);
  int port    = prefs.getInt("mqtt_port", MQTT_PORT);

  ssid.toCharArray(netCfg.wifiSSID, CFG_STR_MAX);
  pass.toCharArray(netCfg.wifiPassword, CFG_STR_MAX);
  mqtt.toCharArray(netCfg.mqttServer, CFG_STR_MAX);
  netCfg.mqttPort = port;

  prefs.end();

  Serial.println(F(">> [Config] Loaded from NVS:"));
  printNetConfig();
}

void saveNetConfig() {
  prefs.begin("ignis_net", false);  // read-write
  prefs.putString("wifi_ssid", netCfg.wifiSSID);
  prefs.putString("wifi_pass", netCfg.wifiPassword);
  prefs.putString("mqtt_srv", netCfg.mqttServer);
  prefs.putInt("mqtt_port", netCfg.mqttPort);
  prefs.end();

  Serial.println(F(">> [Config] Saved to NVS! Reboot to apply."));
}

void printNetConfig() {
  Serial.println(F("┌─────────── Network Config ───────────┐"));
  Serial.print(F("│  WiFi SSID:    ")); Serial.println(netCfg.wifiSSID);
  Serial.print(F("│  WiFi Pass:    ")); 
  // Ẩn password, chỉ hiện 2 ký tự đầu
  String masked = String(netCfg.wifiPassword).substring(0, 2) + "******";
  Serial.println(masked);
  Serial.print(F("│  MQTT Server:  ")); Serial.println(netCfg.mqttServer);
  Serial.print(F("│  MQTT Port:    ")); Serial.println(netCfg.mqttPort);
  Serial.println(F("└──────────────────────────────────────┘"));
}

bool handleConfigCommand(const String& line) {
  // wifi:SSID:PASSWORD
  if (line.startsWith("wifi:")) {
    int sep = line.indexOf(':', 5);
    if (sep < 0) {
      Serial.println(F(">> Usage: wifi:SSID:PASSWORD"));
      return true;
    }
    String ssid = line.substring(5, sep);
    String pass = line.substring(sep + 1);
    ssid.trim();
    pass.trim();

    if (ssid.length() == 0) {
      Serial.println(F(">> Error: SSID cannot be empty"));
      return true;
    }

    ssid.toCharArray(netCfg.wifiSSID, CFG_STR_MAX);
    pass.toCharArray(netCfg.wifiPassword, CFG_STR_MAX);
    saveNetConfig();
    Serial.println(F(">> WiFi config updated. Type 'reboot' to reconnect."));
    return true;
  }

  // mqtt:SERVER:PORT  (port optional, default 1883)
  if (line.startsWith("mqtt:")) {
    int sep = line.indexOf(':', 5);
    String server;
    int port = 1883;

    if (sep > 5) {
      server = line.substring(5, sep);
      port = line.substring(sep + 1).toInt();
      if (port <= 0 || port > 65535) port = 1883;
    } else {
      server = line.substring(5);
    }
    server.trim();

    if (server.length() == 0) {
      Serial.println(F(">> Usage: mqtt:SERVER:PORT  (e.g. mqtt:192.168.1.2:1883)"));
      return true;
    }

    server.toCharArray(netCfg.mqttServer, CFG_STR_MAX);
    netCfg.mqttPort = port;
    saveNetConfig();
    Serial.println(F(">> MQTT config updated. Type 'reboot' to reconnect."));
    return true;
  }

  // config — hiển thị config hiện tại
  if (line == "config") {
    printNetConfig();
    return true;
  }

  // reset — xóa NVS, dùng lại default từ Config.h
  if (line == "reset") {
    prefs.begin("ignis_net", false);
    prefs.clear();
    prefs.end();
    Serial.println(F(">> [Config] NVS cleared! Default config restored."));
    Serial.println(F(">> Type 'reboot' to apply."));
    return true;
  }

  // reboot
  if (line == "reboot") {
    Serial.println(F(">> Rebooting..."));
    delay(500);
    ESP.restart();
    return true;
  }

  return false;  // không phải config command
}
