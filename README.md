# 🔥 IGNIS: Automated Fire Suppression System

Hệ thống dò tìm và tự động dập tắt lửa sử dụng công nghệ IoT với ESP32, Camera cảm biến nhiệt, và Dashboard giám sát thời gian thực.

## 📖 Giới thiệu đồ án

**IGNIS** là hệ thống phòng cháy chữa cháy thông minh tự động (Automated Fire Suppression System). Hệ thống sử dụng phần cứng dựa trên ESP32 kết hợp với các cảm biến nhiệt (MLX90614) và cảm biến ngọn lửa để phát hiện sớm các đám cháy. Sau đó, nó tự động hướng vòi phun nước (qua Pan/Tilt Servo) về vị trí ngọn lửa và kích hoạt máy bơm nước để dập tắt. 

Đồng thời, hệ thống cung cấp một bảng điều khiển Web Dashboard theo dõi trạng thái hệ thống, cảnh báo thời gian thực và cho phép quản trị viên điều khiển thủ công (Manual Mode) từ xa.

**Các chế độ hoạt động:**
1. **Auto Mode (Mặc định):** Hệ thống tự động quét bằng Pan Servo. Khi phát hiện lửa, Pan dừng, Tilt Servo quét dọc để tìm đỉnh ngọn lửa bằng cảm biến. Sau đó tự động kích hoạt máy bơm nước.
2. **Manual Mode:** Tắt Auto Mode từ Dashboard. Quản trị viên có thể điều khiển tọa độ Pan/Tilt thủ công trên giao diện Radar map và tự bật/tắt bơm, còi báo.

**Cấu trúc Project:**
- `/firmware`: Mã nguồn C++ chạy trên ESP32 (điều khiển Servo, bơm, đọc cảm biến, kết nối WiFi/MQTT).
- `/back_end`: Spring Boot REST API & WebSocket. Xử lý logic người dùng, lưu trữ lịch sử cháy vào PostgreSQL.
- `/fss-dashboard`: ReactJS + Vite Web UI. Giao diện trực quan giám sát radar, điều khiển hệ thống và hiển thị nhật ký sự cố.

---

## 🐳 Hướng dẫn cài đặt theo Docker (Khuyên dùng)

Cách triển khai này đã được đóng gói sẵn 100%, bạn **KHÔNG CẦN** cài đặt Java, Node.js hay Database trên máy của bạn. Hệ thống sẽ tự động cấu hình Database (PostgreSQL), MQTT Broker (Mosquitto), Backend (Spring Boot) và Frontend (Nginx/React).

**Yêu cầu:** Máy bạn chỉ cần cài đặt `Docker` và `Docker Compose` (hoặc `git` để lấy code).

### Bước 1: Clone dự án
```bash
git clone https://github.com/SieuDoge/fire-suppression-iot.git
cd fire-suppression-iot
```

### Bước 2: Deploy toàn bộ hệ thống (1-Click)
Tại thư mục gốc của dự án, chạy lệnh:
```bash
docker compose up -d --build
```
Hệ thống sẽ tự động tải các container và build backend, frontend. Chờ khoảng vài phút cho đến khi tất cả các dịch vụ (fss_db, mqtt_broker, fss_backend, fss_frontend) báo `done`.

### Bước 3: Truy cập hệ thống
Mở trình duyệt web và truy cập vào IP của máy chủ ở port 80 (chỉ cần gõ thẳng IP hoặc `http://localhost`). Nginx đã tự động định tuyến toàn bộ API và giao diện mượt mà!

---

## 💻 Hướng dẫn cài đặt Non-Docker (Cài tay thủ công)

Nếu bạn không muốn sử dụng file `docker-compose.yml` tổng, bạn phải tự chạy từng phần của dự án.

**Yêu cầu:** Máy tính cần cài sẵn `Java 17+`, `Maven`, `Node.js 18+`, `PostgreSQL` và `Mosquitto`.

### 1. Cấu hình Database & MQTT Broker
**Database (PostgreSQL):**
- Tạo một database tên là `ignis_db`.
- Tên đăng nhập mặc định: `postgres`, mật khẩu: `1203`.
*(Bạn có thể thay đổi trong `back_end/src/main/resources/application.properties`)*

**MQTT Broker (Mosquitto):**
- Chạy Mosquitto Broker ở port mặc định `1883`.
- Đảm bảo thiết lập `allow_anonymous true` trong file cấu hình để ESP32 có thể kết nối.

### 2. Chạy Backend (Spring Boot)
```bash
cd back_end
mvn clean install -DskipTests
mvn spring-boot:run
```
Backend API và WebSocket sẽ chạy ở `http://localhost:8080`.

### 3. Chạy Frontend (React)
```bash
cd fss-dashboard
npm install
npm run dev
```
Giao diện Dashboard sẽ hiển thị ở `http://localhost:5173`. 
*(Lưu ý: Nếu không muốn dùng dữ liệu giả lập (mock data), hãy tạo file `.env` và đặt `VITE_USE_REAL_API=true`)*

---

## ⚡ Hướng dẫn cấu hình Firmware cho ESP32

Để kết nối bo mạch ESP32 với hệ thống, hãy làm theo các bước sau:

1. Mở thư mục `firmware/ignis_esp32` bằng phần mềm **Arduino IDE**.
2. Cài đặt các thư viện cần thiết thông qua Library Manager:
   - `PubSubClient`
   - `ArduinoJson`
   - `ESP32Servo`
   - `Adafruit_MLX90614`
3. Chọn mạch ESP32, cắm cáp và ấn **Upload** code.
4. Mở **Serial Monitor** với tốc độ baud rate là `115200`.
5. **Cấu hình mạng bằng lệnh Serial** (Bo mạch dùng NVS Flash nên sẽ tự lưu config, không cần sửa trong code C++):
   - Thay đổi WiFi: Gõ `wifi:TEN_WIFI:MAT_KHAU` (VD: `wifi:SieuDoge:12345678`)
   - Thay đổi MQTT: Gõ `mqtt:IP_SERVER:1883` (VD: `mqtt:192.168.1.100:1883`)
   - Khởi động lại: Gõ `reboot`

Sau khi khởi động lại, ESP32 sẽ tự động kết nối và bắn dữ liệu realtime lên Dashboard của bạn!
