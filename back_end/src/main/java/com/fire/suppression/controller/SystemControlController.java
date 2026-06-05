package com.fire.suppression.controller;

import com.fire.suppression.dto.ApiResponse;
import com.fire.suppression.service.MqttService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/system")
@RequiredArgsConstructor
public class SystemControlController {

    private final MqttService mqttService;

    @PostMapping("/control")
    public ApiResponse<String> sendControlCommand(@RequestBody Map<String, String> command) {
        String action = command.get("action");
        String value = command.get("value");
        
        String payload = String.format("{\"action\":\"%s\", \"value\":\"%s\"}", action, value);
        mqttService.publish("fire/control", payload);
        
        return ApiResponse.success("Command sent: " + action);
    }
}
