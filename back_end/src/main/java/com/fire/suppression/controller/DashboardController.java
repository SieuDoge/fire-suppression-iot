package com.fire.suppression.controller;

import com.fire.suppression.dto.ApiResponse;
import com.fire.suppression.dto.SensorReadingDTO;
import com.fire.suppression.service.SensorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final SensorService sensorService;

    @GetMapping("/live-sensor")
    public ApiResponse<SensorReadingDTO> getLiveSensorData() {
        List<SensorReadingDTO> latest = sensorService.getLatestReadings(1);
        return ApiResponse.success(latest.isEmpty() ? null : latest.get(0));
    }

    @GetMapping("/chart-data")
    public ApiResponse<List<SensorReadingDTO>> getChartData() {
        return ApiResponse.success(sensorService.getLatestReadings(50));
    }
}
