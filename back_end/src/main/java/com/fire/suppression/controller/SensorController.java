package com.fire.suppression.controller;

import com.fire.suppression.dto.ApiResponse;
import com.fire.suppression.dto.SensorReadingDTO;
import com.fire.suppression.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensors")
@RequiredArgsConstructor
public class SensorController {
    private final SensorService sensorService;

    @GetMapping("/latest")
    public ApiResponse<List<SensorReadingDTO>> getLatestReadings(@RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(sensorService.getLatestReadings(limit));
    }

    @PostMapping
    public ApiResponse<SensorReadingDTO> addReading(@RequestBody SensorReadingDTO dto) {
        return ApiResponse.success(sensorService.saveReading(dto));
    }
}
