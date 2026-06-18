# 🔥 IGNIS: Automated Fire Suppression System

Hệ thống dò tìm và tự động dập tắt lửa sử dụng công nghệ IoT với ESP32, Camera cảm biến nhiệt, và Dashboard giám sát thời gian thực.

## 🛠 Yêu cầu hệ thống (Prerequisites)

- **Phần cứng:** ESP32, MLX90614, Cảm biến ngọn lửa (KY-026, module 4 chân), 2 Servo (Pan/Tilt), Máy bơm, Còi báo.
- **Backend:** Java 17+, Maven, PostgreSQL 14+, Mosquitto MQTT Broker.
- **Frontend:** Node.js 18+, npm/yarn.

---

## 🚀 Hướng dẫn Cài đặt & Chạy (Deployment Guide)

### 1. Cấu hình Database & MQTT Broker (Khuyên dùng Docker)

Hệ thống yêu cầu PostgreSQL cho cơ sở dữ liệu và Mosquitto cho MQTT Broker. Cách nhanh nhất là sử dụng Docker.

**Cách 1: Sử dụng Docker Compose (Khuyên dùng)**
Tạo file `docker-compose.yml` tại thư mục gốc với nội dung:
```yaml
version: '3.8'
services:
  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: fss_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mqtt:
    image: eclipse-mosquitto:latest
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto.conf:/mosquitto/config/mosquitto.conf

volumes:
  postgres_data:
```
Tạo thêm file `mosquitto.conf` cùng thư mục:
```conf
listener 1883
allow_anonymous true
```
Sau đó chạy lệnh:
```bash
docker-compose up -d
```

**Cách 2: Chạy trực tiếp qua Docker CLI**
```bash
# Chạy PostgreSQL
docker run --name fss_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=fss_db -p 5432:5432 -d postgres:14-alpine

# Chạy Mosquitto (yêu cầu tạo file mosquitto.conf trước như trên)
docker run --name mqtt_broker -p 1883:1883 -v $(pwd)/mosquitto.conf:/mosquitto/config/mosquitto.conf -d eclipse-mosquitto:latest
```

*Lưu ý:* Database credentials được cấu hình mặc định trong `back_end/src/main/resources/application.properties` là `postgres` / `password`.

### 3. Backend (Spring Boot)

Backend cung cấp REST API và WebSocket (STOMP) để đồng bộ dữ liệu.

```bash
cd back_end
# Cài đặt thư viện và build
mvn clean install -DskipTests
# Chạy Spring Boot application
mvn spring-boot:run
```
- Backend sẽ chạy tại: `http://localhost:8080`

### 4. Frontend (React + Vite)

Web Dashboard hiển thị trạng thái hệ thống, cảnh báo và điều khiển thủ công.

```bash
cd fss-dashboard
# Cài đặt thư viện
npm install
# Chạy môi trường development
npm run dev
```
- Dashboard sẽ có thể truy cập tại: `http://localhost:5173`
- *Lưu ý*: Hãy tạo tài khoản hoặc dùng tài khoản admin để truy cập Dashboard.

### 5. Nạp Firmware (ESP32)

Mã nguồn cho vi điều khiển ESP32 nằm trong thư mục `firmware/ignis_esp32`.

1. Mở thư mục `firmware/ignis_esp32` bằng Arduino IDE.
2. Cài đặt các thư viện cần thiết:
   - `PubSubClient`
   - `ArduinoJson`
   - `ESP32Servo`
   - `Adafruit_MLX90614`
3. Nạp code vào ESP32.
4. Mở **Serial Monitor** (Baud rate: 115200).
5. **Cấu hình WiFi và MQTT lần đầu:** (Thông qua Serial, không cần sửa code!)
   - Đổi WiFi: `wifi:SSID:MAT_KHAU_WIFI`
   - Đổi IP MQTT Broker: `mqtt:192.168.x.x:1883` (IP máy tính chạy Mosquitto)
   - Khởi động lại: `reboot`

---

## 📁 Cấu trúc Project

- `/firmware`: Mã nguồn C++ chạy trên ESP32. Chứa logic phát hiện lửa, điều khiển Servo (Radar scan) và bơm nước. Có hỗ trợ lưu WiFi/MQTT vào NVS flash.
- `/back_end`: Spring Boot REST API & WebSocket. Xử lý logic người dùng, lưu trữ lịch sử cháy (PostgreSQL).
- `/fss-dashboard`: ReactJS + Vite Web UI. Giám sát radar, nhật ký sự cố, dashboard trực quan và điều khiển.

## 🤝 Chế độ hoạt động (Modes)

1. **Auto Mode (Mặc định):** Hệ thống tự động quét bằng Pan Servo. Khi phát hiện lửa, Pan dừng, Tilt Servo quét dọc để tìm đỉnh ngọn lửa bằng cảm biến MLX90614. Sau đó kích hoạt máy bơm nước.
2. **Manual Mode:** Tắt Auto Mode từ Dashboard. Người dùng có thể dùng tay điều khiển tọa độ Pan/Tilt trên giao diện Radar map và tự bật/tắt bơm, còi báo.
