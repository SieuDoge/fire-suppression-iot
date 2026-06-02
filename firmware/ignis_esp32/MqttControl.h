#ifndef MQTT_CONTROL_H
#define MQTT_CONTROL_H

#include <Arduino.h>

// ===== INITIALIZATION =====
void initNetwork();

// ===== NETWORK HANDLER (WiFi/MQTT Non-blocking Reconnect) =====
void handleNetwork();

// ===== PUBLISH STATE TO MQTT (force = true ignores changes check) =====
void publishState(bool force);

#endif // MQTT_CONTROL_H
