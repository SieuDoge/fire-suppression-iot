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

#define PAN_DEADZONE      12.0f  // Sai số cơ học ±12° — tránh rung servo ngoài trời
#define PAN_STABLE_DEG    12.0f  // Vùng ổn định ±12° trước khi lock
#define PAN_STABLE_MS     200UL
#define PAN_AUTO_HOME_MS  5000UL

void initPanControl();
bool calcAndPan();   // true = có lửa (hoặc đang lock); cập nhật panStable, panStableOnMs
void unlockPan();    // gọi khi tilt hết lửa — giải phóng lock để pan tính lại góc mới
void goHome();

#endif // PANCONTROL_H
