# 🔥 IGNIS: Automated Fire Suppression System

Hệ thống dò tìm và tự động dập tắt lửa sử dụng công nghệ IoT với ESP32, Camera cảm biến nhiệt, và Dashboard giám sát thời gian thực.

## 🛠 Yêu cầu hệ thống (Prerequisites)

- **Phần cứng:** ESP32, MLX90614, Cảm biến ngọn lửa (KY-026, module 4 chân), 2 Servo (Pan/Tilt), Máy bơm, Còi báo.
- **Backend:** Java 17+, Maven, PostgreSQL 14+, Mosquitto MQTT Broker.
- **Frontend:** Node.js 18+, npm/yarn.

---

## 🚀 Hướng dẫn Cài đặt & Chạy (Deployment Guide)

### 1. Cấu hình Database (PostgreSQL)

Hệ thống sử dụng cơ sở dữ liệu PostgreSQL. Bạn có thể sử dụng PostgreSQL cài trực tiếp trên máy hoặc qua Docker.

1. Khởi động PostgreSQL.
2. Tạo database: `CREATE DATABASE fss_db;`
3. Database credentials được cấu hình mặc định trong `back_end/src/main/resources/application.properties`:
   - URL: `jdbc:postgresql://localhost:5432/fss_db`
   - Username: `postgres`
   - Password: `password` (Hãy thay đổi nếu bạn cài pass khác)

### 2. MQTT Broker (Mosquitto)

Dashboard và ESP32 giao tiếp thông qua giao thức MQTT.
1. Cài đặt Mosquitto: [https://mosquitto.org/download/](https://mosquitto.org/download/)
2. Chạy dịch vụ Mosquitto ở port mặc định `1883`.
3. Cho phép truy cập nặc danh (nếu chạy local) bằng cách tạo file `mosquitto.conf` với nội dung:
   ```conf
   listener 1883
   allow_anonymous true
   ```

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
