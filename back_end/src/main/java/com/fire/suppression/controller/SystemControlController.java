package com.fire.suppression.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

    @PostMapping("/control")
    public ApiResponse<String> sendControlCommand(@RequestBody Map<String, String> command) {
        String action = command.get("action");
        String value = command.get("value");

        try {
            Map<String, String> payloadMap = Map.of("action",
                    action != null ? action : "",
                    "value",
                    value != null ? value : "");
            String payload = objectMapper.writeValueAsString(payloadMap);
            mqttService.publish("fire/control", payload);
            return ApiResponse.success("Command sent: " + action);
        } catch (Exception e) {
            return ApiResponse.error("Failed to send command: " + e.getMessage());
        }
    }
}
