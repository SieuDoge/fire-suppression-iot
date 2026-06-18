#include <Arduino.h>
#include "Config.h"
#include "Sensors.h"
#include "PanControl.h"
#include "TiltControl.h"
#include "Actuators.h"
#include "MqttControl.h"
#include "NetworkConfig.h"

// ===== MODE FLAGS =====
bool panAuto  = false;
bool fullAuto = true;    // DEFAULT: AUTO MODE ON

void setup() {
  Serial.begin(115200);
  Serial.setTimeout(100);  // cho readStringUntil nhanh

  initActuators();
  initPanControl();
  initTiltControl();
  initMLX();
  initNetwork();

  Serial.println(F("\n┌──────────────────────────────────────────────────────────┐"));
  Serial.println(F("│       🔥 IGNIS: AUTOMATED FIRE SUPPRESSION SYSTEM        │"));
  Serial.println(F("├──────────────────────────────────────────────────────────┤"));
  Serial.println(F("│  Mode: AUTO (default)                                    │"));
  Serial.println(F("│                                                          │"));
  Serial.println(F("│  [MANUAL TEST]                                           │"));
  Serial.println(F("│    p  →  Print raw sensor status                         │"));
  Serial.println(F("│    t  →  Read temperatures from MLX90614                 │"));
  Serial.println(F("│    1  →  Pump ON          |  0  →  Pump OFF              │"));
  Serial.println(F("│    2  →  Buzzer ON        |  3  →  Buzzer OFF            │"));
  Serial.println(F("│    y  →  Reset Tilt Home (90°)                           │"));
  Serial.println(F("│                                                          │"));
  Serial.println(F("│  [CONFIG — no re-upload needed]                          │"));
  Serial.println(F("│    wifi:SSID:PASSWORD   →  Change WiFi                   │"));
  Serial.println(F("│    mqtt:SERVER:PORT     →  Change MQTT broker            │"));
  Serial.println(F("│    config              →  Show current config            │"));
  Serial.println(F("│    reset               →  Restore default config         │"));
  Serial.println(F("│    reboot              →  Restart ESP32                  │"));
  Serial.println(F("└──────────────────────────────────────────────────────────┘"));
}

void loop() {
  handleNetwork();

  // ── FULL AUTO: pan → tilt → relay + buzzer ────────────────────
  if (fullAuto) {
    bool panFire = calcAndPan();
    updateTilt(panFire);
    delay(120);
  }

  // ── PAN ONLY AUTO ─────────────────────────────────────────────
  else if (panAuto) {
    calcAndPan();
    delay(120);
  }

  // ── SERIAL COMMANDS ───────────────────────────────────────────
  if (Serial.available()) {
    String line = Serial.readStringUntil('\n');
    line.trim();

    if (line.length() == 0) return;

    // Thử xử lý config commands trước (wifi:, mqtt:, config, reset, reboot)
    if (handleConfigCommand(line)) return;

    // Single-char commands cho test nhanh
    char c = line.charAt(0);
    if (c == 'p') printSensors();
    if (c == 't') printMLXTemp();
    if (c == '1') setRelay(true);
    if (c == '0') setRelay(false);
    if (c == '2') setBuzzer(true);
    if (c == '3') setBuzzer(false);
    if (c == 'y') goTiltHome();
  }
}
