#include "Config.h"

int sensorPins[NUM_SENSORS] = {
  S0_PIN,
  S1_PIN,
  S2_PIN,
  S3_PIN,
  S4_PIN,
  S5_PIN,
  S6_PIN
};

float sensorAngles[NUM_SENSORS] = {
  0,
  30,
  60,
  90,
  120,
  150,
  180
};

// S0,S6 = custom
bool isCustom[NUM_SENSORS] = {
  true,
  false,
  false,
  false,
  false,
  false,
  true
};
