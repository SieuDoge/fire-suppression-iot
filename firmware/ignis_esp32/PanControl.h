#ifndef PANCONTROL_H
#define PANCONTROL_H

#include <Arduino.h>
#include <ESP32Servo.h>
#include "Config.h"
#include "Sensors.h"

extern Servo  servoPan;
extern float  lastPanAngle;      // góc đã ghi servo (dead-zone)

// ── Stability ──────────────────────────────────────────────────────
// panStable = true khi góc tính được giữ trong ±PAN_STABLE_DEG
// liên tục PAN_STABLE_MS ms.
// panStableOnMs = millis() lúc panStable lần đầu chuyển → true.
// TiltControl dùng panStableOnMs để đo "pan ổn định 1s".
extern float         stableTargetAngle;
extern unsigned long stableStartTime;
extern unsigned long panStableOnMs;  // mốc panStable trở thành true
extern bool          panStable;

// ── Auto-home ─────────────────────────────────────────────────────
extern unsigned long lastFireMs;     // lần cuối thấy lửa

#define PAN_DEADZONE      5.0f
#define PAN_STABLE_DEG    5.0f
#define PAN_STABLE_MS     200UL
#define PAN_AUTO_HOME_MS  5000UL

void initPanControl();
bool calcAndPan();   // true = có lửa; cập nhật panStable, panStableOnMs
void goHome();

#endif // PANCONTROL_H
