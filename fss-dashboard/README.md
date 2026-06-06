# FSS·CTRL v5 — Fire Suppression System Dashboard

Phiên bản React của hệ thống giám sát & điều khiển chữa cháy thông minh (Nhóm 13),
được chuyển đổi từ 2 file HTML tĩnh (`fss_landing.html`, `fss_dashboard.html`) sang
kiến trúc **React + Vite + React Router + Axios** với cấu trúc chuyên nghiệp, dễ bảo
trì và sẵn sàng kết nối Backend/IoT thật.

## 1. Công nghệ

- **Vite** — build tool & dev server
- **React 18** — component hóa giao diện
- **React Router 6** — điều hướng `/` (Landing) ↔ `/dashboard`
- **Axios** — lớp giao tiếp API (`src/services/api.js`)
- **CSS thuần** — tách riêng, không còn CSS inline/nhúng trong HTML

## 2. Chạy dự án

```bash
npm install      # cài dependencies
npm run dev      # chạy dev server (http://localhost:5173)
npm run build    # build production -> thư mục dist/
npm run preview  # xem thử bản build
```

## 3. Cấu trúc thư mục

```
src/
├── assets/                     # tài nguyên tĩnh (ảnh, icon...)
├── components/
│   ├── landing/                # Navbar, Hero, Features, HowItWorks,
│   │                           #   Specs, CTA, Footer, AuthModal
│   └── dashboard/              # Header, AlertBanner, ServoTrackingMap,
│       │                       #   TrackingBar, StatusBlocks, PumpControl,
│       │                       #   SensorPanel, Timeline, BottomBar
│       └── timeline/           # EventsPane, IncidentsPane, ManualPane, AnalyticsPane
├── context/
│   └── FssContext.jsx          # chia sẻ state & actions cho Dashboard
├── data/
│   └── constants.js            # hằng số (góc cảm biến, áp suất, state khởi tạo...)
├── hooks/
│   ├── useFssSystem.js         # NGUỒN STATE TRUNG TÂM (mô phỏng + polling API)
│   ├── useScrollReveal.js      # hiệu ứng fade-up khi cuộn (Landing)
│   └── useElementSize.js       # đo kích thước khung cho bản đồ servo
├── pages/
│   ├── Landing/Landing.jsx     # trang giới thiệu
│   └── Dashboard/Dashboard.jsx # trang giám sát & điều khiển
├── routes/
│   └── AppRoutes.jsx           # khai báo route
├── services/
│   └── api.js                  # Axios instance + các hàm GET/POST
├── styles/
│   ├── global.css              # reset dùng chung
│   ├── landing.css             # theme đỏ (scope .landing-page)
│   └── dashboard.css           # theme xanh (scope .dashboard-page)
├── utils/
│   ├── kpi.js                  # suy ra KPI (threat, water, health...)
│   └── exporters.js            # xuất CSV / sao chép JSON
├── App.jsx
└── main.jsx
```

> **Lưu ý theme:** Landing (đỏ) và Dashboard (xanh) dùng bộ biến CSS khác nhau.
> Các biến được scope vào `.landing-page` / `.dashboard-page` nên không đè lên nhau.

## 4. Kết nối Backend thật (Axios)

Mặc định Dashboard chạy ở **chế độ mô phỏng (simulation)** hoàn toàn offline — đúng
như bản HTML gốc. Khi backend (Spring Boot) sẵn sàng:

1. Tạo file `.env` từ `.env.example`:
   ```
   VITE_API_BASE_URL=http://localhost:8080
   VITE_USE_REAL_API=true
   VITE_POLL_INTERVAL=1000
   ```
2. (Tùy chọn) Bật proxy trong `vite.config.js` để tránh CORS khi dev.

Các endpoint dự kiến (`src/services/api.js`):

| Method | Endpoint            | Mục đích                          |
|--------|---------------------|-----------------------------------|
| GET    | `/api/sensors`      | trạng thái cảm biến S0–S6         |
| GET    | `/api/system-status`| trạng thái tổng thể               |
| GET    | `/api/servo`        | vị trí pan/tilt                   |
| GET    | `/api/pump`         | trạng thái bơm & bể nước          |
| GET    | `/api/logs`         | lịch sử sự kiện                   |
| GET    | `/api/dashboard`    | snapshot tổng hợp (dùng polling)  |
| POST   | `/api/servo`        | `{ pan, tilt }`                   |
| POST   | `/api/pump`         | `{ on, flowRate, pressure }`      |
| POST   | `/api/mode`         | `{ auto }`                        |
| POST   | `/api/alert`        | `{ level }`                       |

Khi `VITE_USE_REAL_API=true`, hook `useFssSystem` sẽ polling `GET /api/dashboard`
mỗi `VITE_POLL_INTERVAL` ms và đồng bộ dữ liệu thật vào giao diện.

## 5. Ghi chú triển khai

- Khi deploy bản build tĩnh, cấu hình server trả về `index.html` cho mọi route
  (SPA fallback) để `/dashboard` không bị 404 khi tải lại trang.
- Toàn bộ logic thao tác DOM thủ công (`getElementById`) trong bản gốc đã được
  thay bằng React state khai báo, tập trung tại `useFssSystem.js`.
