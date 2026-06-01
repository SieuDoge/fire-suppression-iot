#ifndef TILTCONTROL_H
#define TILTCONTROL_H

#include <Arduino.h>
#include <ESP32Servo.h>
#include "Config.h"
#include "Actuators.h"

enum TiltState {
  TILT_WAIT,       // chờ pan báo lửa
  TILT_SCANNING,   // quét tìm góc lửa (pan vẫn chạy realtime)
  TILT_TRACKING,   // giữ góc, chờ đủ điều kiện relay
  TILT_RETURNING   // về 30°
};

extern Servo     servoTilt;
extern TiltState tiltState;
extern int       lastTiltAngle;

void initTiltControl();
void updateTilt(bool panFire);
void goTiltHome();
void printTiltSensor();

#endif // TILTCONTROL_H
