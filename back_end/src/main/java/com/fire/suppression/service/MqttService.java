package com.fire.suppression.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fire.suppression.dto.Esp32StatusDTO;
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
            Esp32StatusDTO esp32Dto = objectMapper.readValue(payload, Esp32StatusDTO.class);
            
            // Map Esp32StatusDTO to SensorReadingDTO
            SensorReadingDTO dto = SensorReadingDTO.builder()
                    .sensorS0(esp32Dto.getSensors() != null && esp32Dto.getSensors().size() > 0 ? esp32Dto.getSensors().get(0) : 0)
                    .sensorS1(esp32Dto.getSensors() != null && esp32Dto.getSensors().size() > 1 ? esp32Dto.getSensors().get(1) : 0)
                    .sensorS2(esp32Dto.getSensors() != null && esp32Dto.getSensors().size() > 2 ? esp32Dto.getSensors().get(2) : 0)
                    .sensorS3(esp32Dto.getSensors() != null && esp32Dto.getSensors().size() > 3 ? esp32Dto.getSensors().get(3) : 0)
                    .sensorS4(esp32Dto.getSensors() != null && esp32Dto.getSensors().size() > 4 ? esp32Dto.getSensors().get(4) : 0)
                    .sensorS5(esp32Dto.getSensors() != null && esp32Dto.getSensors().size() > 5 ? esp32Dto.getSensors().get(5) : 0)
                    .sensorS6(esp32Dto.getSensors() != null && esp32Dto.getSensors().size() > 6 ? esp32Dto.getSensors().get(6) : 0)
                    .irTemp(esp32Dto.getTempObject())
                    .build();
            
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
        double tempThreshold = 55.0; // Ngưỡng nhiệt độ IR (nhiệt độ thực tế lớn hơn ngưỡng này là có lửa)
        
        return (dto.getSensorS0() != null && dto.getSensorS0() == 1) ||
               (dto.getSensorS1() != null && dto.getSensorS1() == 1) ||
               (dto.getSensorS2() != null && dto.getSensorS2() == 1) ||
               (dto.getSensorS3() != null && dto.getSensorS3() == 1) ||
               (dto.getSensorS4() != null && dto.getSensorS4() == 1) ||
               (dto.getSensorS5() != null && dto.getSensorS5() == 1) ||
               (dto.getSensorS6() != null && dto.getSensorS6() == 1) ||
               (dto.getIrTemp() != null && dto.getIrTemp() > tempThreshold);
    }

    private void handleFireDetection(SensorReadingDTO dto) {
        log.warn("FIRE DETECTED! Triggering alerts...");
        
        // 1. Create Fire Event
        StringBuilder triggered = new StringBuilder();
        if (dto.getSensorS0() != null && dto.getSensorS0() == 1) triggered.append("S0 ");
        if (dto.getSensorS1() != null && dto.getSensorS1() == 1) triggered.append("S1 ");
        if (dto.getSensorS2() != null && dto.getSensorS2() == 1) triggered.append("S2 ");
        if (dto.getSensorS3() != null && dto.getSensorS3() == 1) triggered.append("S3 ");
        if (dto.getSensorS4() != null && dto.getSensorS4() == 1) triggered.append("S4 ");
        if (dto.getSensorS5() != null && dto.getSensorS5() == 1) triggered.append("S5 ");
        if (dto.getSensorS6() != null && dto.getSensorS6() == 1) triggered.append("S6 ");

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
