#include "Sensors.h"
#include <Wire.h>
#include <Adafruit_MLX90614.h>

Adafruit_MLX90614 mlx = Adafruit_MLX90614();

// ===== FIRE CHECK =====
bool hasFire(int idx, int val) {
  if (isCustom[idx]) {
    return val < FIRE_THRESHOLD_KY;
  }
  else {
    return val > FIRE_THRESHOLD_MOD;
  }
}

// ===== WEIGHT =====
float fireWeight(int idx, int val) {
  if (isCustom[idx]) {
    return FIRE_THRESHOLD_KY - val;
  }
  else {
    return val;
  }
}

// ===== RAW PRINT =====
void printSensors() {
  Serial.println("\n[Raw Sensors]");
  for (int i = 0; i < NUM_SENSORS; i++) {
    int val = analogRead(sensorPins[i]);
    Serial.print("S");
    Serial.print(i);
    Serial.print(" (");
    Serial.print(sensorAngles[i]);
    Serial.print("°): ");
    Serial.print(val);
    Serial.println(hasFire(i, val) ? " 🔥" : " —");
  }
}

// ===== MLX90614 TEMPERATURE SENSOR =====
bool initMLX() {
  Wire.begin();
  // Check if device responds at default 0x5A address
  Wire.beginTransmission(0x5A);
  if (Wire.endTransmission() != 0) {
    Serial.println("[MLX90614] Sensor NOT found at I2C address 0x5A!");
    return false;
  }
  mlx.begin();
  Serial.println("[MLX90614] Sensor detected and initialized.");
  return true;
}

float readMLXAmbient() {
  return mlx.readAmbientTempC();
}

float readMLXObject() {
  return mlx.readObjectTempC();
}

void printMLXTemp() {
  Serial.println("\n[MLX90614 Temp]");
  float amb = readMLXAmbient();
  float obj = readMLXObject();
  
  if (isnan(amb) || isnan(obj)) {
    Serial.println("  Error: Could not read temperature data.");
  } else {
    Serial.print("  Ambient Temp: ");
    Serial.print(amb);
    Serial.println(" °C");
    Serial.print("  Object Temp:  ");
    Serial.print(obj);
    Serial.println(" °C");
  }
}
