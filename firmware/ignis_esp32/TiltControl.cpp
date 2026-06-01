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

// ===== INIT =====
void initTiltControl() {
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
      if (panFire) {
        stateHeader("\U0001f525 Pan có lửa  →  SCANNING         ");
        scanAngle  = TILT_MIN;
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

    // ── SCANNING ─────────────────────────────────────────────────────
    // Pan chạy tự do realtime trong lúc quét.
    // Không lock, không check panDrifted.
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
        int  val    = analogRead(TILT_SENSOR_PIN);
        bool onFire = val < FIRE_THRESHOLD_TILT;

        Serial.print(F("[SCAN]  "));
        if (scanAngle < 100) Serial.print(' ');
        if (scanAngle <  10) Serial.print(' ');
        Serial.print(scanAngle);
        Serial.print(F("°  val="));
        Serial.print(val);
        Serial.println(onFire ? F("  \U0001f525  FOUND") : F("  —"));

        if (onFire) {
          lastTiltAngle = scanAngle;
          tiltFireStart = now;   // bắt đầu đếm 2s tilt
          lastPrintMs   = 0;
          alarmOn       = false;
          tiltState     = TILT_TRACKING;
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
    // Relay tắt chỉ khi tilt sensor mất lửa → RETURNING.
    case TILT_TRACKING:
      if (now - lastStepMs < 150) return;
      lastStepMs = now;

      {
        int  val    = analogRead(TILT_SENSOR_PIN);
        bool onFire = val < FIRE_THRESHOLD_TILT;

        if (!onFire) {
          // Lửa mất → tắt relay, reset
          if (alarmOn) {
            setAlarm(false);
            alarmOn = false;
          }
          stateHeader("\U0001f9ef Tilt mất lửa  →  RETURNING       ");
          tiltState = TILT_RETURNING;
          return;
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
          Serial.print(F("°  val="));
          Serial.print(val);
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
          Serial.print(alarmOn ? F("  \U0001f7e5 RELAY=ON") : F("  \u25a1 waiting"));
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
  int  val    = analogRead(TILT_SENSOR_PIN);
  bool onFire = val < FIRE_THRESHOLD_TILT;
  Serial.print(F("[TILT-SENSOR]  GPIO36  val="));
  Serial.print(val);
  Serial.println(onFire ? F("  \U0001f525 FIRE") : F("  —"));
}
