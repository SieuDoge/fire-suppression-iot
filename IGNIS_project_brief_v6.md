# 🔥 Project Brief — IGNIS: Fully Automated Fire Suppression System (IoT)
> **v6** — cập nhật sau khi firmware ESP32 hoàn thành, đổi chân S6/Tilt, review backend

---

## Context

Đồ án IoT mid-level — sinh viên IT đại học Việt Nam. Background Java, đang học ESP32.
Mục tiêu: prototype chạy được để demo bảo vệ đồ án, ghi điểm cao.

---

## Mô Tả Tổng Quan

Hệ thống phát hiện lửa bằng cụm **7 flame sensor cố định** xếp hình vòng cung 180° (cách nhau 30°) để xác định góc ngang (pan) qua weighted average. Sau khi pan xong, **1 flame sensor gắn trên servo tilt** quét dọc từ 0°–150° để dò vị trí lửa theo chiều đứng — phát hiện thì dừng, chốt góc tilt, bật bơm dập. Tích hợp IoT: cảnh báo Telegram, lưu log PostgreSQL, dashboard React real-time có login phân quyền Admin/Viewer.

---

## Stack Công Nghệ

| Layer | Công nghệ |
|---|---|
| Vi điều khiển | ESP32 DevKit V1 38-pin (Arduino framework, C++) |
| Backend | Java 21 — Spring Boot 3.3 (REST API) |
| Database | PostgreSQL 15 (Docker) |
| MQTT Broker | Eclipse Mosquitto 2 (Docker) |
| Dashboard | React (real-time qua WebSocket) |
| Thông báo | Telegram Bot |
| Communication | MQTT (ESP32 ↔ Spring Boot) — thư viện PubSubClient |
| Build Tool | Maven (wrapper `mvnw`) |

> **Đã bỏ:** Web Push Notification → thay bằng WebSocket, đơn giản hơn 80%, đủ điểm demo.

---

## Danh Sách Linh Kiện

| # | Linh kiện | SL | Ghi chú |
|---|---|---|---|
| 1 | ESP32 DevKit V1 38-pin | 1 | Não chính, WiFi sẵn |
| 2 | Servo MG996R | 2 | Pan (ngang) + Tilt (dọc) |
| 3 | Pan-Tilt Bracket 2 trục | 1 | Giữ vòi + sensor tilt |
| 4 | Flame Sensor KY-026 (4 chân) | 2 | S0 (0°) + S6 (180°) — sensor custom 2 đầu |
| 5 | Module IR Flame Sensor 5 kênh | 1 | S1–S5 (30°, 60°, 90°, 120°, 150°) — **cấp 3.3V hoặc dùng voltage divider nếu cấp 5V** |
| 6 | Flame Sensor KY-026 (riêng) | 1 | Gắn trên servo tilt — sensor dọc |
| 7 | Mini Water Pump 12V | 1 | Bơm dập lửa |
| 8 | Relay Module 2 kênh | 1 | Điều khiển bơm + dự phòng |
| 9 | Buzzer | 1 | Cảnh báo âm thanh |
| 10 | MLX90614 (GY-906) | 1 | Đo nhiệt độ IR — log/dashboard, không dùng detect lửa |
| 11 | Adapter 12V DC ≥ 2A | 1 | Nguồn bơm |
| 12 | Nguồn 5V riêng ≥ 2A | 1 | **Bắt buộc** cho 2× Servo MG996R |
| 13 | Ống silicon + dây | — | Kết nối vật lý |

> ⚠️ **Servo MG996R kéo ~1A/con khi có tải** — phải lấy nguồn 5V riêng, KHÔNG lấy từ pin 5V ESP32.

---

## Pin Map ESP32 (Chính Thức v6 — Đã Đổi Chân S6 ↔ Tilt)

> 🔵 = Đã đổi so với v5

| GPIO ESP32 | Kết nối tới | Loại | Ghi chú |
|---|---|---|---|
| GPIO 34 | Flame Sensor S0 (0°) — A0 | Analog IN | ADC1, Input only |
| GPIO 35 | Flame Sensor S1 (30°) — A0 | Analog IN | ADC1, Input only |
| GPIO 32 | Flame Sensor S2 (60°) — A0 | Analog IN | ADC1 |
| GPIO 33 | Flame Sensor S3 (90°) — A0 | Analog IN | ADC1 |
| GPIO 13 | Flame Sensor S4 (120°) — A0 | Analog IN | ⚠️ ADC2 — **bị mù khi WiFi bật** (luôn trả 0) |
| GPIO 39 | Flame Sensor S5 (150°) — A0 | Analog IN | ADC1, Input only |
| 🔵 GPIO 36 | Flame Sensor S6 (180°) — **A0** | **Analog IN** | ADC1 — đổi từ GPIO 4 lên để tránh xung đột WiFi |
| 🔵 GPIO 4 | Tilt Sensor (KY-026) — **D0** | **Digital IN** | ADC2 — đọc Digital nên không bị WiFi ảnh hưởng |
| GPIO 18 | Servo Pan (signal) | PWM OUT | |
| GPIO 19 | Servo Tilt (signal) | PWM OUT | |
| GPIO 26 | Relay IN (bơm) | Digital OUT | Active LOW |
| GPIO 25 | Buzzer | Digital OUT | HIGH = kêu |
| GPIO 21 | MLX90614 SDA | I2C | |
| GPIO 22 | MLX90614 SCL | I2C | |

> ⚠️ **S4 (GPIO 13)** bị phế khi bật WiFi do xung đột ADC2. Hiện tại chấp nhận mất góc 120°. Nếu cần có thể chuyển sang đọc Digital (1 dòng code).

---

## Cấu Trúc Thư Mục Dự Án

```
src/
├── firmware/ignis_esp32/     ← Code ESP32 (Arduino) ✅ HOÀN THÀNH
│   ├── ignis_esp32.ino       ← Main sketch
│   ├── Config.h / Config.cpp ← Pin map, WiFi/MQTT config
│   ├── Sensors.h / Sensors.cpp
│   ├── PanControl.h / PanControl.cpp
│   ├── TiltControl.h / TiltControl.cpp
│   ├── Actuators.h / Actuators.cpp
│   └── MqttControl.h / MqttControl.cpp
│
├── backend/                  ← Spring Boot (Java) ⚠️ ĐANG LÀM
│   ├── pom.xml
│   └── src/main/java/com/ignis/     ← Package gốc: com.ignis
│       ├── IgnisApplication.java
│       ├── controller/
│       ├── entity/
│       └── repository/
│
├── frontend/                 ← React Dashboard ❌ CHƯA LÀM
├── database/migrations/
├── mosquitto/mosquitto.conf  ← Cấu hình Mosquitto broker
└── docker-compose.yml        ← PostgreSQL + Mosquitto
```

---

## MQTT Payload (ESP32 → Backend)

Topic: `fire/status`

```json
{
  "pan": 45.0,
  "tilt": 75,
  "sensors": [1, 1, 0, 0, 0, 0, 0],
  "tilt_sensor": 1,
  "pump": true,
  "temp_ambient": 28.5,
  "temp_object": 150.2
}
```

> ESP32 dùng **delta-publishing**: chỉ gửi khi trạng thái thay đổi hoặc heartbeat mỗi 10s.

---

## Database Schema (PostgreSQL)

> ⚠️ Database name trong docker-compose.yml là **`ignis_db`**, user: `postgres`, password: `postgres`.

```sql
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(10)  NOT NULL CHECK (role IN ('admin', 'viewer')),
    created_at    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE fire_events (
    id                 SERIAL PRIMARY KEY,
    detected_at        TIMESTAMP NOT NULL,
    extinguished_at    TIMESTAMP,
    pan_angle          FLOAT,
    tilt_angle         FLOAT,
    max_temp           FLOAT,
    duration_seconds   INT,
    triggered_sensors  VARCHAR(30)  -- "s0,s1,s2"
);

-- Bảng lưu trạng thái sensor theo thời gian (cho biểu đồ dashboard)
CREATE TABLE sensor_readings (
    id            SERIAL PRIMARY KEY,
    recorded_at   TIMESTAMP DEFAULT NOW(),
    pan_angle     FLOAT,
    tilt_angle    INT,
    s0 INT, s1 INT, s2 INT, s3 INT, s4 INT, s5 INT, s6 INT,
    tilt_sensor   INT,
    pump          BOOLEAN,
    temp_ambient  FLOAT,
    temp_object   FLOAT
);
```

---

## Kiến Trúc Hệ Thống

```
[Hardware Layer]  ✅ HOÀN THÀNH
  7× Flame Sensor cố định (KY-026 + module 5 kênh) → vòng cung 180°, detect pan
  1× Flame Sensor trên servo tilt (D0, Digital)     → quét dọc 0°–150°, detect tilt
  1× MLX90614 (GY-906)                              → đo nhiệt độ IR, log only
  Pan-Tilt Servo × 2                                ←
  Relay + Pump + Buzzer                             ←
         ↕ MQTT publish "fire/status" (PubSubClient + ArduinoJson)
[Backend — Java / Spring Boot]  ⚠️ ĐANG LÀM
  MQTT Broker (Mosquitto — Docker)
  MQTT Subscriber → parse JSON payload
  REST API (Spring Boot)
  Fire event processor (tạo/cập nhật fire_events)
  Telegram Bot service
  WebSocket server (STOMP — real-time push)
         ↕ JPA (Hibernate)
[Database — PostgreSQL — Docker]
  fire_events   — log sự kiện
  users         — admin / viewer
  sensor_readings — raw data cho dashboard
         ↕ REST API + WebSocket
[Frontend — React]  ❌ CHƯA LÀM
  Login page (JWT)
  Dashboard real-time
  Admin panel
  Event log history
```

---

## Phân Quyền Dashboard

| Tính năng | Admin | Viewer |
|---|---|---|
| Xem dashboard, log, trạng thái | ✅ | ✅ |
| Điều khiển thủ công (bơm, servo) | ✅ | ❌ |
| Xem lịch sử sự kiện | ✅ | ✅ |
| Xóa lịch sử | ✅ | ❌ |
| Quản lý user | ✅ | ❌ |

---

## Tiến Độ Hiện Tại & Việc Cần Làm

### ✅ Phase 1 — Hardware & ESP32 — HOÀN THÀNH

| # | Việc | Trạng thái |
|---|---|---|
| 1 | Wiring + debug GPIO conflicts | ✅ Xong |
| 2 | Code ESP32: 7 sensor pan + weighted average + peak filtering | ✅ Xong |
| 3 | Tilt scan + tracking + stability detection | ✅ Xong |
| 4 | Relay + Buzzer + debounce 5s tắt bơm | ✅ Xong |
| 5 | WiFi + MQTT publish (non-blocking, delta) | ✅ Xong |
| 6 | MLX90614 nhiệt độ (ambient + object) | ✅ Xong |
| 7 | Đổi chân S6 → GPIO 36 (Analog), Tilt → GPIO 4 (Digital) | ✅ Xong |

### ⚠️ Phase 2 — Backend Spring Boot — CẦN SỬA + BỔ SUNG

**Package gốc đã đổi thành: `com.ignis`**

#### 🔴 Bugs cần sửa ngay

| # | Bug | Chi tiết |
|---|---|---|
| B1 | Entity `SensorReading` sai hoàn toàn | Hiện có `sensor_n/s/e/w` — phải đổi thành `s0–s6, tilt_sensor, pan_angle, tilt_angle, pump, temp_ambient, temp_object` khớp MQTT payload |
| B2 | `application.properties` sai DB name | Đang là `fire_suppression_db` — phải đổi thành `ignis_db` cho khớp `docker-compose.yml` |
| B3 | `application.properties` sai password | Đang hardcode `110506` — Docker Compose dùng `postgres` |
| B4 | `triggered_sensors` length quá ngắn | `length = 20` không đủ — phải sửa thành `30` |
| B5 | `SystemControlController` sẽ crash | `(int) command.get("panAngle")` → `ClassCastException` khi JSON gửi Double |

#### 🟡 Features chưa có (theo Brief)

| # | Feature | Cần làm |
|---|---|---|
| F1 | **MQTT Subscriber** | Thêm `spring-integration-mqtt` dependency + Config + Message Handler. Parse JSON từ `fire/status`, lưu `sensor_readings`, detect fire event, trigger WebSocket + Telegram |
| F2 | **WebSocket (STOMP)** | Thêm `spring-boot-starter-websocket` + Config. Push real-time khi MQTT nhận payload mới. Endpoint: `/ws`, topic: `/topic/status` |
| F3 | **Telegram Bot** | Service gọi Telegram Bot API `sendMessage`. Trigger: phát hiện lửa mới + dập xong |
| F4 | **JWT Security** | Thêm `spring-boot-starter-security` + `jjwt`. Login endpoint `POST /api/auth/login`. JWT Filter. Phân quyền Admin/Viewer trên từng endpoint |
| F5 | **UserRepository** | Có Entity `User.java` nhưng thiếu Repository |
| F6 | **MQTT Publish (control)** | `SystemControlController` phải publish lệnh xuống ESP32 qua topic `fire/control` thay vì chỉ lưu RAM |

#### 🟢 Cải thiện kiến trúc (nếu có thời gian)

| # | Cải thiện |
|---|---|
| A1 | Tách Service layer: Controller → Service → Repository |
| A2 | Thêm DTO / Response wrapper (tránh lộ passwordHash của User) |

#### Dependencies cần thêm trong `pom.xml`

```xml
<!-- WebSocket -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

<!-- MQTT -->
<dependency>
    <groupId>org.springframework.integration</groupId>
    <artifactId>spring-integration-mqtt</artifactId>
</dependency>

<!-- Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.6</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.6</version>
    <scope>runtime</scope>
</dependency>

<!-- Lombok (optional — giảm boilerplate getter/setter) -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

### ❌ Phase 3 — React Dashboard — CHƯA LÀM

| # | Việc cần làm | Risk | Ghi chú |
|---|---|---|---|
| 9 | Login page + JWT | 🟢 Thấp | |
| 10 | Dashboard real-time (WebSocket) | 🟡 Trung | CORS phải đúng |
| 11 | Admin panel + event log | 🟢 Thấp | CRUD standard |

### Phase 4 — Demo Prep *(quan trọng không kém code)*

| # | Việc cần làm |
|---|---|
| 12 | Kịch bản demo live — đốt bật lửa gas mini, test nhiều lần |
| 13 | Quay video backup từ buổi test thành công (phòng hardware lỗi live) |
| 14 | Slide giải thích weighted average bằng hình vẽ |

---

## Rủi Ro & Mitigation

| Rủi ro | Mức độ | Mitigation |
|---|---|---|
| Servo MG996R kéo quá dòng từ ESP32 | 🔴 Cao | Nguồn 5V riêng ≥ 2A, chỉ share GND |
| GPIO 12 (strapping pin) gây boot fail | ✅ Đã xử lý | Không dùng GPIO 12 |
| GPIO 14 (ADC2) xung đột WiFi | ✅ Đã xử lý | Đã đổi S5 → GPIO 39 |
| S6 trên ADC2 (GPIO 4) bị mù WiFi | ✅ Đã xử lý | **Đổi S6 → GPIO 36 (ADC1, Analog)** |
| Tilt sensor trên ADC1 lãng phí | ✅ Đã xử lý | **Đổi Tilt → GPIO 4 (Digital D0)** |
| S4 (GPIO 13, ADC2) bị mù WiFi | 🟡 Chấp nhận | Mất góc 120° — có thể chuyển Digital nếu cần |
| Module 5 kênh cấp 5V → hỏng GPIO | 🔴 Cao | Cấp 3.3V cho module |
| Backend Entity sai so với MQTT payload | 🔴 Cao | **Phải sửa `SensorReading` entity ngay** |
| MQTT mất kết nối | 🟡 Trung | Auto-reconnect ESP32 (đã code) + Spring Boot (cần code) |
| Demo hardware lỗi live | 🔴 Cao | Video backup từ buổi test thành công |

---

## Khuyến Nghị Cắt Giảm (nếu thiếu thời gian)

1. **Bỏ Web Push** → đã thay bằng WebSocket ✅
2. **Bỏ `sensor_readings` table** → chỉ log `fire_events` là đủ
3. **Bỏ tính năng xóa lịch sử của Admin** → không ảnh hưởng điểm
4. **Bỏ Telegram Bot** → demo có WebSocket real-time là đủ ghi điểm
5. **Security đơn giản** → có thể dùng Basic Auth thay JWT nếu gấp

---

## Success Criteria

- [x] 7 flame sensor đọc đúng, weighted average tính đúng góc pan
- [x] Sensor tilt quét 0°–150°, dừng đúng khi phát hiện lửa
- [x] Servo pan/tilt xoay đúng góc, vòi chỉ đúng vị trí lửa
- [x] Bơm bật/tắt đúng, có debounce 5s
- [x] ESP32 MQTT publish thành công (delta + heartbeat)
- [ ] Spring Boot MQTT subscribe + parse payload
- [ ] PostgreSQL lưu đủ fire_events
- [ ] Telegram alert khi có lửa và khi dập xong
- [ ] Dashboard React real-time, login phân quyền đúng
- [ ] Demo live ổn định hoặc có video backup
