package com.fire.suppression.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fire.suppression.dto.FireEventDTO;
import com.fire.suppression.dto.SensorReadingDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class MqttService {

    private final MessageChannel mqttOutboundChannel;
    private final SensorService sensorService;
    private final FireEventService fireEventService;
    private final TelegramService telegramService;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMessage(Message<?> message) {
        Object payloadObj = message.getPayload();
        String payload;
        
        if (payloadObj instanceof byte[]) {
            payload = new String((byte[]) payloadObj, StandardCharsets.UTF_8);
        } else {
            payload = payloadObj.toString();
        }
        
        log.info("Received MQTT message: {}", payload);
        
        try {
            SensorReadingDTO dto = objectMapper.readValue(payload, SensorReadingDTO.class);
            SensorReadingDTO savedDto = sensorService.saveReading(dto);
            
            // Broadcast sensor data via WebSocket
            messagingTemplate.convertAndSend("/topic/sensors", savedDto);
            
            // Fire Detection Logic
            if (isFireDetected(savedDto)) {
                handleFireDetection(savedDto);
            }
            
        } catch (Exception e) {
            log.error("Error processing MQTT message: {}", e.getMessage());
        }
    }

    private boolean isFireDetected(SensorReadingDTO dto) {
        int threshold = 500; // Ngưỡng cảm biến lửa (thấp hơn là có lửa)
        double tempThreshold = 55.0; // Ngưỡng nhiệt độ IR
        
        return (dto.getSensorS0() != null && dto.getSensorS0() < threshold) ||
               (dto.getSensorS1() != null && dto.getSensorS1() < threshold) ||
               (dto.getSensorS2() != null && dto.getSensorS2() < threshold) ||
               (dto.getSensorS3() != null && dto.getSensorS3() < threshold) ||
               (dto.getSensorS4() != null && dto.getSensorS4() < threshold) ||
               (dto.getSensorS5() != null && dto.getSensorS5() < threshold) ||
               (dto.getSensorS6() != null && dto.getSensorS6() < threshold) ||
               (dto.getIrTemp() != null && dto.getIrTemp() > tempThreshold);
    }

    private void handleFireDetection(SensorReadingDTO dto) {
        log.warn("FIRE DETECTED! Triggering alerts...");
        
        // 1. Create Fire Event
        StringBuilder triggered = new StringBuilder();
        if (dto.getSensorS0() != null && dto.getSensorS0() < 500) triggered.append("S0 ");
        if (dto.getSensorS1() != null && dto.getSensorS1() < 500) triggered.append("S1 ");
        if (dto.getSensorS2() != null && dto.getSensorS2() < 500) triggered.append("S2 ");
        if (dto.getSensorS3() != null && dto.getSensorS3() < 500) triggered.append("S3 ");
        if (dto.getSensorS4() != null && dto.getSensorS4() < 500) triggered.append("S4 ");
        if (dto.getSensorS5() != null && dto.getSensorS5() < 500) triggered.append("S5 ");
        if (dto.getSensorS6() != null && dto.getSensorS6() < 500) triggered.append("S6 ");

        FireEventDTO event = FireEventDTO.builder()
                .detectedAt(LocalDateTime.now())
                .maxTemp(dto.getIrTemp())
                .triggeredSensors(triggered.toString().trim())
                .build();
        
        fireEventService.saveEvent(event);
        
        // 2. Telegram Alert
        String alertMsg = String.format("🔥 *CẢNH BÁO CÓ CHÁY!* 🔥\n" +
                "Thời gian: %s\n" +
                "Cảm biến kích hoạt: %s\n" +
                "Nhiệt độ IR: %.2f°C", 
                LocalDateTime.now().toString(), triggered.toString(), dto.getIrTemp());
        telegramService.sendNotification(alertMsg);
        
        // 3. WebSocket Alert
        messagingTemplate.convertAndSend("/topic/alerts", event);
    }

    public void publish(String topic, String payload) {
        mqttOutboundChannel.send(MessageBuilder.withPayload(payload)
                .setHeader("mqtt_topic", topic)
                .build());
    }
}
