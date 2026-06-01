#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include "Config.h"

// ===== FIRE CHECK =====
bool hasFire(int idx, int val);

// ===== WEIGHT =====
float fireWeight(int idx, int val);

// ===== RAW PRINT =====
void printSensors();

// ===== MLX90614 TEMPERATURE SENSOR =====
bool initMLX();
float readMLXAmbient();
float readMLXObject();
void printMLXTemp();

#endif // SENSORS_H
