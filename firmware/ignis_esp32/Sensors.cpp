#include "Sensors.h"
#include <Wire.h>
#include <Adafruit_MLX90614.h>

Adafruit_MLX90614 mlx = Adafruit_MLX90614();
static bool mlxReady = false;

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
  Serial.println(F("\n┌─────────────────────────────────────────── Raw Sensors ───────────────────────────────────────────┐"));
  Serial.print(F("│ "));
  for (int i = 0; i < NUM_SENSORS; i++) {
    int val = analogRead(sensorPins[i]);
    Serial.print(F("S")); Serial.print(i);
    Serial.print(F(": "));
    
    // Padding to 4 digits
    if (val < 1000) Serial.print(' ');
    if (val < 100)  Serial.print(' ');
    if (val < 10)   Serial.print(' ');
    Serial.print(val);
    
    Serial.print(hasFire(i, val) ? F("🔥") : F("— "));
    if (i < NUM_SENSORS - 1) Serial.print(F(" │ "));
  }
  Serial.println(F(" │"));
  Serial.println(F("└───────────────────────────────────────────────────────────────────────────────────────────────────┘"));
}

// ===== MLX90614 TEMPERATURE SENSOR =====
bool initMLX() {
  Wire.begin();
  Wire.beginTransmission(0x5A);
  if (Wire.endTransmission() != 0) {
    Serial.println("[MLX90614] Sensor NOT found at I2C address 0x5A!");
    mlxReady = false;
    return false;
  }
  mlx.begin();
  mlxReady = true;
  Serial.println("[MLX90614] Sensor detected and initialized.");
  return true;
}

float readMLXAmbient() {
  if (!mlxReady) return 0.0f;
  return mlx.readAmbientTempC();
}

float readMLXObject() {
  if (!mlxReady) return 0.0f;
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
