package com.ignis.controller;

import com.ignis.entity.FireEvent;
import com.ignis.repository.FireEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class FireEventController {

    @Autowired
    private FireEventRepository fireEventRepository;

    // 1. API lấy toàn bộ lịch sử sự kiện cháy (Sắp xếp từ mới nhất đến cũ nhất)
    @GetMapping("/all")
    public ResponseEntity<List<FireEvent>> getAllEvents() {
        List<FireEvent> events = fireEventRepository.findAllByOrderByIdDesc();
        return ResponseEntity.ok(events);
    }

    // 2. API dành cho Admin xóa lịch sử sự kiện
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable Long id) {
        if (fireEventRepository.existsById(id)) {
            fireEventRepository.deleteById(id);
            return ResponseEntity.ok("Event deleted successfully");
        }
        return ResponseEntity.notFound().build();
    }
}
