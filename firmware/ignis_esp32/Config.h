#ifndef CONFIG_H
#define CONFIG_H

#define PAN_PIN     18
#define TILT_PIN    19
#define RELAY_PIN   26   // Active LOW — LOW = bơm BẬT
#define BUZZER_PIN  25   // HIGH = kêu

// ===== TILT SENSOR (KY-026 trên servo tilt) =====
#define TILT_SENSOR_PIN     4
#define FIRE_THRESHOLD_TILT 500   // custom KY-026: DƯỚI = lửa

// ===== TILT RANGE =====
#define TILT_HOME     90   // góc home (manual)
#define TILT_DEFAULT  30   // góc đứng chờ sau khi hết lửa
#define TILT_MIN       0   // góc quét thấp nhất
#define TILT_MAX     150   // góc quét cao nhất
#define TILT_STEP      5   // bước quét (độ)

// ===== ĐẢO NGƯỢC SENSOR =====
#define S0_PIN    34    // custom trái
#define S1_PIN    35    // H1
#define S2_PIN    32    // H2
#define S3_PIN    33    // H3
#define S4_PIN    13    // H4
#define S5_PIN    39    // H5
#define S6_PIN    36    // custom phải

#define NUM_SENSORS          7
#define FIRE_THRESHOLD_KY   500
#define FIRE_THRESHOLD_MOD  200

extern int sensorPins[NUM_SENSORS];
extern float sensorAngles[NUM_SENSORS];
extern bool isCustom[NUM_SENSORS];

// ===== WIFI & MQTT CONFIGURATION =====
#define WIFI_SSID           "HuuHuynh"
#define WIFI_PASSWORD       "12052006"
#define MQTT_SERVER         "192.168.1.2"      // Thay bằng IP máy chạy Mosquitto
#define MQTT_PORT           1883
#define MQTT_CLIENT_ID      "esp32_ignis"
#define MQTT_TOPIC_STATUS   "fire/status"
#define HEARTBEAT_INTERVAL  10000UL              // 10s gửi heartbeat

#endif // CONFIG_H
