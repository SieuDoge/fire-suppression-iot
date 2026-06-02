package com.ignis.controller;

import com.ignis.entity.SensorReading;
import com.ignis.repository.SensorReadingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensors")
@CrossOrigin(origins = "*") // Cho phép React Dashboard gọi API không bị lỗi CORS
public class SensorController {

    @Autowired
    private SensorReadingRepository sensorReadingRepository;

    // 1. API lấy dữ liệu cảm biến mới nhất (React sẽ call liên tục hoặc dùng polling)
    @GetMapping("/latest")
    public ResponseEntity<SensorReading> getLatestReading() {
        // Lấy bản ghi mới nhất dựa trên ID giảm dần
        SensorReading latest = sensorReadingRepository.findTopByOrderByIdDesc();
        return ResponseEntity.ok(latest);
    }

    // 2. API để ESP32 hoặc script test gửi dữ liệu sensor lên lưu vào DB
    @PostMapping("/data")
    public ResponseEntity<String> receiveSensorData(@RequestBody SensorReading reading) {
        sensorReadingRepository.save(reading);
        return ResponseEntity.ok("Data saved successfully");
    }
}
