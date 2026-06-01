#include "Actuators.h"

static bool relayOn = false;

void initActuators() {
  pinMode(RELAY_PIN,  OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(RELAY_PIN,  LOW);  // Active LOW → HIGH = tắt khi khởi động
  digitalWrite(BUZZER_PIN, LOW);
  Serial.println(">> [Actuators] Relay + Buzzer init OK.");
}

void setRelay(bool on) {
  relayOn = on;
  digitalWrite(RELAY_PIN, on ? HIGH : LOW);  // Active LOW
  Serial.print(">> [Relay] "); Serial.println(on ? "ON (bơm BẬT)" : "OFF (bơm TẮT)");
}

void setBuzzer(bool on) {
  digitalWrite(BUZZER_PIN, on ? HIGH : LOW);
  Serial.print(">> [Buzzer] "); Serial.println(on ? "ON" : "OFF");
}

void setAlarm(bool on) {
  setRelay(on);
  setBuzzer(on);
}

bool isRelayOn() {
  return relayOn;
}
