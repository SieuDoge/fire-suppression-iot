#include "PanControl.h"

Servo        servoPan;

float        lastPanAngle     = 90.0f;

float         stableTargetAngle = 90.0f;
unsigned long stableStartTime   = 0;
unsigned long panStableOnMs     = 0;
bool          panStable         = false;

unsigned long lastFireMs = 0;

static int           lockSampleCount = 0;     // số mẫu đã thu (0–5)
static float         lockAngleSum    = 0.0f;  // tổng góc các mẫu
static unsigned long firstSampleMs  = 0;     // mốc lấy mẫu đầu tiên
static unsigned long lastSampleMs   = 0;     // mốc lấy mẫu cuối

#define LOCK_SAMPLE_INTERVAL_MS  200UL  // lấy mẫu mỗi 200ms
#define LOCK_MAX_MS             1000UL  // force lock sau tối đa 1 giây

// ===== INIT =====
void initPanControl() {
  servoPan.attach(PAN_PIN);
  servoPan.write(90);
  lastPanAngle      = 90.0f;
  stableTargetAngle = 90.0f;
  stableStartTime   = millis();
  panStableOnMs     = 0;
  panStable         = false;
  lockSampleCount   = 0;
  lockAngleSum      = 0.0f;
  firstSampleMs     = 0;
  lastSampleMs      = 0;
  lastFireMs        = millis();   // tránh auto-home ngay lúc boot
  delay(500);
}

// ===== CALC + PAN — true = có lửa (hoặc đang lock) =====
bool calcAndPan() {
  // ── Đã lock — không cần đọc sensor, giữ nguyên, chờ tilt giải phóng ──
  if (panStable) return true;

  int values[NUM_SENSORS];
  for (int i = 0; i < NUM_SENSORS; i++) values[i] = analogRead(sensorPins[i]);

  // ── Pass 1: tính weight từng sensor, tìm max ─────────────────────
  float weights[NUM_SENSORS];
  float maxWeight = 0;
  for (int i = 0; i < NUM_SENSORS; i++) {
    weights[i] = hasFire(i, values[i]) ? fireWeight(i, values[i]) : 0;
    if (weights[i] > maxWeight) maxWeight = weights[i];
  }

  // ── Pass 2: Peak filtering — chỉ giữ sensor >= 70% max ────────────
  float weightedSum = 0, totalWeight = 0;
  float peakThreshold = 0.70f * maxWeight;
  for (int i = 0; i < NUM_SENSORS; i++) {
    if (maxWeight > 0 && weights[i] >= peakThreshold) {
      weightedSum += sensorAngles[i] * weights[i];
      totalWeight += weights[i];
    }
  }

  bool  hasFl    = (totalWeight > 0);
  float panAngle = hasFl ? constrain(weightedSum / totalWeight, 0, 180) : 0;
  unsigned long now = millis();

  // ── Log (throttled 500ms) ─────────────────────────────────────
  static unsigned long lastPanPrintMs = 0;
  static bool          lastHadFire    = false;
  if (hasFl) {
    if (!lastHadFire || (now - lastPanPrintMs >= 500)) {
      lastPanPrintMs = now; lastHadFire = true;
      Serial.print(F("[PAN] \U0001f525 "));
      if (panAngle < 100) Serial.print(' ');
      if (panAngle <  10) Serial.print(' ');
      Serial.print(panAngle, 1);
      Serial.println(F("°"));
    }
  } else {
    if (lastHadFire) { lastHadFire = false;
      Serial.println(F("[PAN] \U0001f343 No fire  —  Standby")); }
    return false;  // không có lửa, chưa lock → báo tật
  }

  // ── Có lửa — thu mẫu có kiểm soát thời gian ────────────────────
  lastFireMs = now;

  bool doSample = false;
  if (lockSampleCount == 0) {
    // Mẫu đầu tiên: lấy ngay
    firstSampleMs = now;
    lastSampleMs  = now;
    doSample = true;
  } else if ((now - lastSampleMs) >= LOCK_SAMPLE_INTERVAL_MS) {
    // Mẫu tiếp theo: chờ đủ 200ms
    lastSampleMs = now;
    doSample = true;
  }

  if (doSample && lockSampleCount < 5) {
    lockAngleSum += panAngle;
    lockSampleCount++;
    Serial.print(F("[PAN] \U0001f525 mẫu "));
    Serial.print(lockSampleCount); Serial.print(F("/5  @ "));
    if (panAngle < 100) Serial.print(' ');
    if (panAngle <  10) Serial.print(' ');
    Serial.print(panAngle, 1); Serial.println(F("°"));
  }

  // Lock khi đủ 5 mẫu HOẶC quá 1 giây (force lock với mẫu hiện có)
  bool timesUp = (lockSampleCount > 0 && (now - firstSampleMs) >= LOCK_MAX_MS);
  if (lockSampleCount >= 5 || timesUp) {
    float lockedAngle = constrain(lockAngleSum / (float)lockSampleCount, 0.0f, 180.0f);
    stableTargetAngle = lockedAngle;
    servoPan.write((int)lockedAngle);
    lastPanAngle  = lockedAngle;
    panStable     = true;
    panStableOnMs = now;
    Serial.print(F("        \u2713 LOCK @ "));
    Serial.print(lockedAngle, 1);
    Serial.print(F("°  (TB "));
    Serial.print(lockSampleCount);
    Serial.print(F(" mẫu / "));
    Serial.print((now - firstSampleMs));
    Serial.println(F("ms)"));
  }

  return true;
}

// ===== UNLOCK PAN (gọi bởi TiltControl khi tilt hết lửa) =====
// Chỉ điểm này mới giải phóng lock — pan tự tính lại góc mới.
void unlockPan() {
  panStable       = false;
  panStableOnMs   = 0;
  lockSampleCount = 0;
  lockAngleSum    = 0.0f;
  firstSampleMs   = 0;
  lastSampleMs    = 0;
  Serial.println(F("[PAN]  \U0001f513 Unlock — sẵn sàng bắt góc mới"));
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
