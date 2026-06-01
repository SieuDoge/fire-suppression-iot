#ifndef ACTUATORS_H
#define ACTUATORS_H

#include <Arduino.h>
#include "Config.h"

void initActuators();
void setRelay(bool on);
void setBuzzer(bool on);
void setAlarm(bool on);   // bật/tắt cả relay + buzzer cùng lúc

bool isRelayOn();

#endif // ACTUATORS_H
