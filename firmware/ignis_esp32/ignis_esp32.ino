#include <Arduino.h>
#include "Config.h"
#include "Sensors.h"
#include "PanControl.h"
#include "TiltControl.h"
#include "Actuators.h"

// ===== MODE FLAGS =====
bool panAuto  = false;
bool fullAuto = false;

void setup() {
  Serial.begin(115200);

  initActuators();
  initPanControl();
  initTiltControl();
  initMLX();

  Serial.println("\n=== IGNIS — Pan + Tilt + Relay + Buzzer ===");
  Serial.println("--- Auto ---");
  Serial.println("  f → FULL AUTO ON  (pan → tilt → relay + buzzer)");
  Serial.println("  x → FULL AUTO OFF");
  Serial.println("  a → Pan AUTO ON  (pan only)");
  Serial.println("  z → Pan AUTO OFF");
  Serial.println("--- Manual ---");
  Serial.println("  s → pan 1 lần");
  Serial.println("  r → pan về home");
  Serial.println("  p → raw 7 sensor pan");
  Serial.println("  y → tilt về home (90°)");
  Serial.println("  q → raw sensor tilt");
  Serial.println("  t → đọc nhiệt độ MLX90614");
  Serial.println("  1 → relay ON  |  0 → relay OFF");
  Serial.println("  2 → buzzer ON |  3 → buzzer OFF");
}

void loop() {

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
