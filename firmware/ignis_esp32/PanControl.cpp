#include "PanControl.h"

Servo        servoPan;

float        lastPanAngle     = 90.0f;

float         stableTargetAngle = 90.0f;
unsigned long stableStartTime   = 0;
unsigned long panStableOnMs     = 0;
bool          panStable         = false;

unsigned long lastFireMs = 0;

// ===== INIT =====
void initPanControl() {
  servoPan.attach(PAN_PIN);
  servoPan.write(90);
  lastPanAngle      = 90.0f;
  stableTargetAngle = 90.0f;
  stableStartTime   = millis();
  panStableOnMs     = 0;
  panStable         = false;
  lastFireMs        = millis();   // tránh auto-home ngay lúc boot
  delay(500);
}

// ===== CALC + PAN — true = có lửa =====
bool calcAndPan() {
  int values[NUM_SENSORS];
  for (int i = 0; i < NUM_SENSORS; i++) values[i] = analogRead(sensorPins[i]);

  // ── Pass 1: tính weight từng sensor, tìm max ───────────────────────
  float weights[NUM_SENSORS];
  float maxWeight = 0;
  for (int i = 0; i < NUM_SENSORS; i++) {
    weights[i] = hasFire(i, values[i]) ? fireWeight(i, values[i]) : 0;
    if (weights[i] > maxWeight) maxWeight = weights[i];
  }

  // ── Pass 2: Peak filtering — chỉ giữ sensor >= 70% max ──────────────
  // Loại bỏ sensor yếu tránh kéo góc lệch khi lửa tập trung 1 phía.
  float weightedSum = 0, totalWeight = 0;
  float peakThreshold = 0.70f * maxWeight;
  bool  included[NUM_SENSORS];
  for (int i = 0; i < NUM_SENSORS; i++) {
    included[i] = (maxWeight > 0 && weights[i] >= peakThreshold);
    if (included[i]) {
      weightedSum += sensorAngles[i] * weights[i];
      totalWeight += weights[i];
    }
  }

  bool  hasFl    = (totalWeight > 0);
  float panAngle = hasFl ? constrain(weightedSum / totalWeight, 0, 180) : 0;

  // ── In 1 dòng: góc + raw sensor (Throttled & clean) ──────────────────
  static unsigned long lastPanPrintMs = 0;
  static bool lastHadFire = false;
  unsigned long now = millis();

  if (hasFl) {
    if (!lastHadFire || (now - lastPanPrintMs >= 500)) {
      lastPanPrintMs = now;
      lastHadFire = true;
      Serial.print(F("[PAN] \U0001f525 "));
      if (panAngle < 100) Serial.print(' ');
      if (panAngle <  10) Serial.print(' ');
      Serial.print(panAngle, 1);
      Serial.println(F("°"));
    }
  } else {
    if (lastHadFire) {
      lastHadFire = false;
      Serial.println(F("[PAN] 🍃 No fire detected  —  Standby"));
    }
  }

  // ── Không có lửa ─────────────────────────────────────────────────
  if (!hasFl) {
    if (panStable) {
      // panStable → false: reset mốc
      Serial.println(F("        \u2514 pan mất ổn định"));
    }
    panStable     = false;
    panStableOnMs = 0;
    stableStartTime = millis();
    return false;
  }

  // ── Có lửa ───────────────────────────────────────────────────────
  lastFireMs = millis();

  // ── Stability detection ───────────────────────────────────────────
  float drift = fabsf(panAngle - stableTargetAngle);
  now = millis();

  if (drift > PAN_STABLE_DEG) {
    // Lửa ra ngoài vùng → reset anchor
    stableTargetAngle = panAngle;
    stableStartTime   = now;
    if (panStable) Serial.println(F("        \u21ba reset anchor"));
    panStable     = false;
    panStableOnMs = 0;
  } else if ((now - stableStartTime) >= PAN_STABLE_MS && !panStable) {
    panStable     = true;
    panStableOnMs = now;   // ghi nhận mốc ổn định
    Serial.print(F("        \u2713 stable @ "));
    Serial.print(stableTargetAngle, 1); Serial.println(F("°"));
  }

  // ── Servo write (dead-zone) ───────────────────────────────────────
  if (fabsf(panAngle - lastPanAngle) > PAN_DEADZONE) {
    servoPan.write((int)panAngle);
    lastPanAngle = panAngle;
  }

  return true;
}

// ===== HOME =====
void goHome() {
  servoPan.write(90);
  lastPanAngle      = 90.0f;
  stableTargetAngle = 90.0f;
  stableStartTime   = millis();
  panStable         = false;
  panStableOnMs     = 0;
  Serial.println(F("[PAN]  \U0001f3e0 home → 90°"));
}
