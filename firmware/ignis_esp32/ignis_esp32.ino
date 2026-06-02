#include <Arduino.h>
#include "Config.h"
#include "Sensors.h"
#include "PanControl.h"
#include "TiltControl.h"
#include "Actuators.h"
#include "MqttControl.h"

// ===== MODE FLAGS =====
bool panAuto  = false;
bool fullAuto = false;

void setup() {
  Serial.begin(115200);

  initActuators();
  initPanControl();
  initTiltControl();
  initMLX();
  initNetwork();

  Serial.println(F("\n┌────────────────────────────────────────────────────────┐"));
  Serial.println(F("│       🔥 IGNIS: AUTOMATED FIRE SUPPRESSION SYSTEM       │"));
  Serial.println(F("├────────────────────────────────────────────────────────┤"));
  Serial.println(F("│  [AUTO MODE COMMANDS]                                  │"));
  Serial.println(F("│    f  →  FULL AUTO ON  (Pan → Tilt → Relay + Buzzer)    │"));
  Serial.println(F("│    x  →  FULL AUTO OFF                                 │"));
  Serial.println(F("│    a  →  PAN ONLY AUTO ON                              │"));
  Serial.println(F("│    z  →  PAN ONLY AUTO OFF                             │"));
  Serial.println(F("│                                                        │"));
  Serial.println(F("│  [MANUAL TEST COMMANDS]                                │"));
  Serial.println(F("│    s  →  Trigger single Pan check                      │"));
  Serial.println(F("│    r  →  Reset Pan to Home (90°)                       │"));
  Serial.println(F("│    p  →  Print raw horizontal sensor values            │"));
  Serial.println(F("│    y  →  Reset Tilt to Home (90°)                      │"));
  Serial.println(F("│    q  →  Print raw Tilt sensor status                  │"));
  Serial.println(F("│    t  →  Read temperatures from MLX90614               │"));
  Serial.println(F("│    1  →  Turn Water Pump ON   |  0  →  Turn Pump OFF    │"));
  Serial.println(F("│    2  →  Turn Buzzer ON       |  3  →  Turn Buzzer OFF  │"));
  Serial.println(F("└────────────────────────────────────────────────────────┘"));
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
    char c = Serial.read();

    // full auto
    if (c == 'f') {
      fullAuto = true; panAuto = false;
      Serial.println(">> FULL AUTO ON");
    }
    if (c == 'x') {
      fullAuto = false;
      setAlarm(false);
      Serial.println(">> FULL AUTO OFF");
    }

    // pan auto
    if (c == 'a') { panAuto = true;  fullAuto = false; Serial.println(">> [Pan] AUTO ON");  }
    if (c == 'z') { panAuto = false; Serial.println(">> [Pan] AUTO OFF"); }

    // pan manual
    if (c == 's') calcAndPan();
    if (c == 'r') goHome();
    if (c == 'p') printSensors();

    // tilt manual
    if (c == 'y') goTiltHome();
    if (c == 'q') printTiltSensor();
    if (c == 't') printMLXTemp();

    // relay + buzzer manual
    if (c == '1') setRelay(true);
    if (c == '0') setRelay(false);
    if (c == '2') setBuzzer(true);
    if (c == '3') setBuzzer(false);
  }
}
