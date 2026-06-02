package com.ignis.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/control")
@CrossOrigin(origins = "*")
public class SystemControlController {

    // Lưu tạm trạng thái điều khiển trong bộ nhớ (Memory)
    private boolean manualMode = false;
    private boolean pumpStatus = false;
    private int panAngle = 90;
    private int tiltAngle = 45;

    // 1. API lấy trạng thái điều khiển hiện tại
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getControlStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("manualMode", manualMode);
        status.put("pumpStatus", pumpStatus);
        status.put("panAngle", panAngle);
        status.put("tiltAngle", tiltAngle);
        return ResponseEntity.ok(status);
    }

    // 2. API cập nhật lệnh điều khiển từ Dashboard (Chỉ Admin gọi)
    @PostMapping("/update")
    public ResponseEntity<String> updateControl(@RequestBody Map<String, Object> command) {
        if (command.containsKey("manualMode")) manualMode = (boolean) command.get("manualMode");
        if (command.containsKey("pumpStatus")) pumpStatus = (boolean) command.get("pumpStatus");
        if (command.containsKey("panAngle")) panAngle = (int) command.get("panAngle");
        if (command.containsKey("tiltAngle")) tiltAngle = (int) command.get("tiltAngle");

        return ResponseEntity.ok("Control command updated");
    }
}
