#include "TiltControl.h"
#include "PanControl.h"    // panStable, panStableOnMs, lastFireMs

Servo     servoTilt;
TiltState tiltState     = TILT_WAIT;
int       lastTiltAngle = TILT_DEFAULT;

static int           scanAngle      = TILT_MIN;
static unsigned long lastStepMs     = 0;
static unsigned long lastPrintMs    = 0;    // throttle tracking log → 1s
static unsigned long tiltFireStart  = 0;    // mốc tilt bắt đầu liên tục thấy lửa
static bool          alarmOn        = false;
static unsigned long lastTiltFireMs = 0;    // mốc thời gian cuối cùng phát hiện lửa

// Relay ON khi cả 2 điều kiện đồng thời đạt:
//   Pan: panStable + giữ ổn định >= PAN_RELAY_MS
//   Tilt: tilt sensor liên tục thấy lửa >= TILT_RELAY_MS
#define PAN_RELAY_MS   1000UL   // 1s pan ổn định ±5°
#define TILT_RELAY_MS  2000UL   // 2s tilt giữ lửa liên tục

// ── Helper: in header khi chuyển state ───────────────────────────────
static void stateHeader(const char* msg) {
  Serial.println(F("  ┌────────────────────────────────┐"));
  Serial.print(  F("  │  ")); Serial.print(msg);
  Serial.println(F("  │"));
  Serial.println(F("  └────────────────────────────────┘"));
}

// ── Helper: đọc tilt sensor 5 lần, cần >= 2 lần LOW mới báo lửa ─────────
// Tránh nhiễu chớp thoáng qua, nhưng vẫn nhạy hơn đọc 1 lần
static bool readTiltFire() {
  const int SAMPLES   = 5;   // số lần đọc
  const int THRESHOLD = 2;   // cần ít nhất bao nhiêu lần LOW
  int lowCount = 0;
  for (int i = 0; i < SAMPLES; i++) {
    if (digitalRead(TILT_SENSOR_PIN) == LOW) lowCount++;
    delayMicroseconds(200);  // 200µs giữa mỗi lần đọc
  }
  return (lowCount >= THRESHOLD);
}

// ===== INIT =====
void initTiltControl() {
  pinMode(TILT_SENSOR_PIN, INPUT_PULLUP);
  servoTilt.attach(TILT_PIN);
  servoTilt.write(TILT_DEFAULT);
  lastTiltAngle = TILT_DEFAULT;
  alarmOn       = false;
  delay(500);
  Serial.println(F("[TILT]  Init OK  —  standby @ 30°"));
}

// ===== UPDATE =====
void updateTilt(bool panFire) {
  unsigned long now = millis();

  switch (tiltState) {

    // ── WAIT ─────────────────────────────────────────────────────────
    case TILT_WAIT:
      if (panStable) {
        // Chỉ bắt đầu quét khi pan đã lock xong (trung bình 5 mẫu)
        stateHeader("\U0001f525 Pan LOCK  →  SCANNING tilt      ");
        scanAngle  = TILT_MIN;   // bắt đầu từ đầu mỗi lần
        lastStepMs = now;
        tiltState  = TILT_SCANNING;
      } else {
        // Auto-home pan sau 5s không có lửa
        if ((now - lastFireMs) > PAN_AUTO_HOME_MS) {
          if (fabsf(lastPanAngle - 90.0f) > PAN_DEADZONE) {
            Serial.println(F("[PAN]  \u23f1  5s no fire  →  auto-home 90°"));
            goHome();
          }
        }
      }
      break;

    // ── SCANNING ─────────────────────────────────────────────────
    // Pan đã lock, tilt quét từ TILT_MIN → TILT_MAX để tìm góc lửa.
    case TILT_SCANNING:
      if (!panFire) {
        Serial.println(F("[SCAN]  Pan mất lửa  →  abort"));
        tiltState = TILT_RETURNING;
        return;
      }

      if (now - lastStepMs < 150) return;
      lastStepMs = now;

      servoTilt.write(scanAngle);
      {
        bool onFire = readTiltFire();  // đọc 5 mẫu, cần â2 lần LOW

        Serial.print(F("[SCAN]  "));
        if (scanAngle < 100) Serial.print(' ');
        if (scanAngle <  10) Serial.print(' ');
        Serial.print(scanAngle);
        Serial.println(onFire ? F("°  \U0001f525  FOUND") : F("°  —"));

        if (onFire) {
          lastTiltAngle  = scanAngle;
          tiltFireStart  = now;
          lastTiltFireMs = now;
          lastPrintMs    = 0;
          alarmOn        = false;
          tiltState      = TILT_TRACKING;
          stateHeader("\U0001f525 Tilt thấy lửa  →  TRACKING        ");
          return;
        }
      }

      scanAngle += TILT_STEP;
      if (scanAngle > TILT_MAX) {
        Serial.println(F("[SCAN]  Quét xong  —  không thấy lửa"));
        tiltState = TILT_RETURNING;
      }
      break;

    // ── TRACKING ─────────────────────────────────────────────────────
    // Giữ góc Tilt. Pan tracking realtime.
    // Relay ON khi: panStable ≥ 1s  VÀ  tilt fire liên tục ≥ 2s.
    // Relay tắt chỉ khi tilt sensor mất lửa (sau 5s) → RETURNING.
    case TILT_TRACKING:
      if (now - lastStepMs < 150) return;
      lastStepMs = now;

      {
        bool onFire = readTiltFire();  // đọc 5 mẫu, cần ≥2 lần LOW
        int  val    = onFire ? 100 : 4095;

        if (onFire) {
          lastTiltFireMs = now;
        } else {
          // Lửa mất
          if (alarmOn) {
            // Nếu bơm đang chạy, áp dụng debounce trễ tắt bơm 5s
            unsigned long elapsedNoFire = now - lastTiltFireMs;
            if (elapsedNoFire >= 5000UL) {
              setAlarm(false);
              alarmOn = false;
              stateHeader("\U0001f9ef Mất lửa > 5s  →  RETURNING       ");
              tiltState = TILT_RETURNING;
              return;
            }
          } else {
            // Chưa bật bơm mà mất lửa → trả về và quét lại từ đầu
            stateHeader("\U0001f9ef Mất lửa khi chưa bật bơm  →  RETURNING");
            tiltState = TILT_RETURNING;
            return;
          }
        }

        // Tính thời gian ổn định
        unsigned long tiltMs = now - tiltFireStart;
        unsigned long panMs  = (panStable && panStableOnMs > 0)
                               ? (now - panStableOnMs) : 0;

        // Điều kiện relay
        bool tiltOk = (tiltMs >= TILT_RELAY_MS);
        bool panOk  = (panMs  >= PAN_RELAY_MS);

        if (!alarmOn && tiltOk && panOk) {
          setAlarm(true);
          alarmOn = true;
          stateHeader("\u2705 Pan 1s + Tilt 2s  →  RELAY ON!     ");
        }

        // In status 1 lần/giây
        if (now - lastPrintMs >= 1000) {
          lastPrintMs = now;
          Serial.print(F("[TRACK]  tilt="));
          Serial.print(lastTiltAngle);
          Serial.print(F("°"));
          // Pan countdown
          Serial.print(F("  pan="));
          if (panOk) {
            Serial.print(F("\u2713"));
          } else {
            Serial.print(panMs / 1000); Serial.print(F("."));
            Serial.print((panMs % 1000) / 100); Serial.print(F("s/1s"));
          }
          // Tilt countdown
          Serial.print(F("  tilt="));
          if (tiltOk) {
            Serial.print(F("\u2713"));
          } else {
            Serial.print(tiltMs / 1000); Serial.print(F("."));
            Serial.print((tiltMs % 1000) / 100); Serial.print(F("s/2s"));
          }
          
          if (alarmOn) {
            if (onFire) {
              Serial.print(F("  \U0001f7e5 RELAY=ON"));
            } else {
              float timeLeft = (5000.0f - (float)(now - lastTiltFireMs)) / 1000.0f;
              Serial.print(F("  \u26a0 COOLDOWN: "));
              Serial.print(timeLeft, 1);
              Serial.print(F("s"));
            }
          } else {
            Serial.print(F("  \u25a1 waiting"));
          }
          Serial.println();
        }
      }
      break;

    // ── RETURNING ────────────────────────────────────────────────────
    case TILT_RETURNING:
      if (alarmOn) {
        setAlarm(false);
        alarmOn = false;
      }
      servoTilt.write(TILT_DEFAULT);
      lastTiltAngle = TILT_DEFAULT;
      tiltFireStart = 0;
      unlockPan();    // giải phóng lock pan — pan sẽ tính lại góc mới nếu vẫn còn lửa
      tiltState     = TILT_WAIT;
      Serial.print(F("[TILT]  \U0001f3e0 Về "));
      Serial.print(TILT_DEFAULT);
      Serial.println(F("°  —  standby"));
      break;
  }
}

// ===== MANUAL HOME =====
void goTiltHome() {
  if (alarmOn) { setAlarm(false); alarmOn = false; }
  tiltState = TILT_WAIT;
  servoTilt.write(TILT_HOME);
  lastTiltAngle = TILT_HOME;
  tiltFireStart = 0;
  Serial.println(F("[TILT]  Manual home → 90°"));
}

// ===== RAW PRINT =====
void printTiltSensor() {
  bool onFire = (digitalRead(TILT_SENSOR_PIN) == LOW);
  Serial.print(F("[TILT-SENSOR]  GPIO4: "));
  Serial.println(onFire ? F("\U0001f525 FIRE") : F("—"));
}
