#ifndef NETWORK_CONFIG_H
#define NETWORK_CONFIG_H

#include <Arduino.h>

// Kích thước tối đa cho chuỗi config
#define CFG_STR_MAX 64

// Struct chứa config mạng
struct NetConfig {
  char wifiSSID[CFG_STR_MAX];
  char wifiPassword[CFG_STR_MAX];
  char mqttServer[CFG_STR_MAX];
  int  mqttPort;
};

extern NetConfig netCfg;

// Load config từ NVS (nếu chưa có thì dùng default từ Config.h)
void loadNetConfig();

// Save config hiện tại vào NVS
void saveNetConfig();

// Xử lý serial command để đổi config
// Trả về true nếu đã xử lý (consume command)
bool handleConfigCommand(const String& line);

// In config hiện tại ra Serial
void printNetConfig();

#endif // NETWORK_CONFIG_H
