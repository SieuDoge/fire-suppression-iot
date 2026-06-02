package com.ignis.controller;

import com.ignis.entity.SensorReading;
import com.ignis.repository.SensorReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*") // Chống lỗi CORS khi gọi từ máy ảo hoặc domain React khác
public class DashboardController {

    @Autowired
    private SensorReadingRepository sensorReadingRepository;


    @GetMapping("/live-sensor") // API lấy thông số cảm biến mới nhất (Dashboard sẽ Polling API này liên tục để lấy dữ liệu)
    public ResponseEntity<SensorReading> getLiveSensorData() {
        return ResponseEntity.ok(sensorReadingRepository.findLatestData());
    }

    // API trả về mảng dữ liệu phục vụ biểu đồ nhiệt độ
    @GetMapping("/chart-data")
    public ResponseEntity<List<SensorReading>> getChartData() {
        return ResponseEntity.ok(sensorReadingRepository.findRecentRecords());
    }
}
