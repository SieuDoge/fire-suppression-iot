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
import java.time.temporal.ChronoUnit;

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

    // --- Fire lifecycle state ---
    private boolean fireActive = false;
    private LocalDateTime fireStartTime = null;
    private Integer activeFireEventId = null;
    private Double maxTempDuringFire = null;
    private String lastTriggeredSensors = "";

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

            // Map Esp32StatusDTO → SensorReadingDTO (đầy đủ tất cả trường)
            SensorReadingDTO dto = SensorReadingDTO.builder()
                    .sensorS0(getSensorValue(esp32Dto, 0))
                    .sensorS1(getSensorValue(esp32Dto, 1))
                    .sensorS2(getSensorValue(esp32Dto, 2))
                    .sensorS3(getSensorValue(esp32Dto, 3))
                    .sensorS4(getSensorValue(esp32Dto, 4))
                    .sensorS5(getSensorValue(esp32Dto, 5))
                    .sensorS6(getSensorValue(esp32Dto, 6))
                    .tiltSensor(esp32Dto.getTiltSensor())
                    .panAngle(esp32Dto.getPan())
                    .tiltAngle(esp32Dto.getTilt())
                    .pump(esp32Dto.getPump())
                    .tempAmbient(esp32Dto.getTempAmbient())
                    .tempObject(esp32Dto.getTempObject())
                    .build();

            SensorReadingDTO savedDto = sensorService.saveReading(dto);

            // Broadcast sensor data via WebSocket
            messagingTemplate.convertAndSend("/topic/sensors", savedDto);

            // Fire Detection Logic
            boolean fireDetected = isFireDetected(dto);

            if (fireDetected && !fireActive) {
                // Lửa MỚI phát hiện → tạo fire_event + Telegram
                handleFireStart(dto, esp32Dto);
            } else if (fireDetected && fireActive) {
                // Lửa vẫn đang cháy → chỉ cập nhật maxTemp, triggeredSensors
                updateOngoingFire(dto, esp32Dto);
            } else if (!fireDetected && fireActive) {
                // Lửa đã tắt → cập nhật extinguishedAt + Telegram "dập xong"
                handleFireEnd();
            }

        } catch (Exception e) {
            log.error("Error processing MQTT message: {}", e.getMessage(), e);
        }
    }

    private int getSensorValue(Esp32StatusDTO esp32Dto, int index) {
        if (esp32Dto.getSensors() != null && esp32Dto.getSensors().size() > index) {
            return esp32Dto.getSensors().get(index);
        }
        return 0;
    }

    private boolean isFireDetected(SensorReadingDTO dto) {
        double tempThreshold = 55.0;

        return (dto.getSensorS0() != null && dto.getSensorS0() == 1) ||
               (dto.getSensorS1() != null && dto.getSensorS1() == 1) ||
               (dto.getSensorS2() != null && dto.getSensorS2() == 1) ||
               (dto.getSensorS3() != null && dto.getSensorS3() == 1) ||
               (dto.getSensorS4() != null && dto.getSensorS4() == 1) ||
               (dto.getSensorS5() != null && dto.getSensorS5() == 1) ||
               (dto.getSensorS6() != null && dto.getSensorS6() == 1) ||
               (dto.getTempObject() != null && dto.getTempObject() > tempThreshold);
    }

    /**
     * Lửa MỚI phát hiện lần đầu → tạo 1 fire_event + gửi 1 Telegram cảnh báo
     */
    private void handleFireStart(SensorReadingDTO dto, Esp32StatusDTO esp32Dto) {
        log.warn("🔥 FIRE DETECTED! Creating fire event...");

        fireActive = true;
        fireStartTime = LocalDateTime.now();
        maxTempDuringFire = dto.getTempObject();
        lastTriggeredSensors = buildTriggeredSensors(dto);

        FireEventDTO event = FireEventDTO.builder()
                .detectedAt(fireStartTime)
                .panAngle(esp32Dto.getPan())
                .tiltAngle(esp32Dto.getTilt() != null ? esp32Dto.getTilt().doubleValue() : null)
                .maxTemp(dto.getTempObject())
                .triggeredSensors(lastTriggeredSensors)
                .build();

        FireEventDTO savedEvent = fireEventService.saveEvent(event);
        activeFireEventId = savedEvent.getId();

        // Telegram alert — phát hiện lửa
        String alertMsg = String.format(
                "🔥 *CẢNH BÁO CÓ CHÁY!* 🔥\n" +
                "Thời gian: %s\n" +
                "Cảm biến kích hoạt: %s\n" +
                "Góc Pan: %.1f° | Tilt: %d°\n" +
                "Nhiệt độ: %.1f°C",
                fireStartTime.toString(),
                lastTriggeredSensors,
                esp32Dto.getPan() != null ? esp32Dto.getPan() : 0.0,
                esp32Dto.getTilt() != null ? esp32Dto.getTilt() : 0,
                dto.getTempObject() != null ? dto.getTempObject() : 0.0);
        telegramService.sendNotification(alertMsg);

        // WebSocket Alert
        messagingTemplate.convertAndSend("/topic/alerts", savedEvent);
    }

    /**
     * Lửa vẫn đang cháy → cập nhật maxTemp, triggeredSensors (KHÔNG tạo event mới, KHÔNG gửi Telegram)
     */
    private void updateOngoingFire(SensorReadingDTO dto, Esp32StatusDTO esp32Dto) {
        // Cập nhật maxTemp
        if (dto.getTempObject() != null && (maxTempDuringFire == null || dto.getTempObject() > maxTempDuringFire)) {
            maxTempDuringFire = dto.getTempObject();
        }
        // Cập nhật triggered sensors (merge)
        String currentTriggered = buildTriggeredSensors(dto);
        if (!currentTriggered.equals(lastTriggeredSensors)) {
            lastTriggeredSensors = mergeTriggeredSensors(lastTriggeredSensors, currentTriggered);
        }
    }

    /**
     * Tất cả sensor = 0, lửa đã tắt → cập nhật fire_event + gửi Telegram "dập xong"
     */
    private void handleFireEnd() {
        log.info("✅ Fire extinguished. Updating fire event...");

        LocalDateTime now = LocalDateTime.now();
        long durationSeconds = ChronoUnit.SECONDS.between(fireStartTime, now);

        // Cập nhật fire_event hiện tại
        if (activeFireEventId != null) {
            FireEventDTO updateDto = FireEventDTO.builder()
                    .id(activeFireEventId)
                    .detectedAt(fireStartTime)
                    .extinguishedAt(now)
                    .maxTemp(maxTempDuringFire)
                    .durationSeconds((int) durationSeconds)
                    .triggeredSensors(lastTriggeredSensors)
                    .build();
            fireEventService.updateEvent(activeFireEventId, updateDto);
        }

        // Telegram — dập xong
        String msg = String.format(
                "✅ *ĐÃ DẬP TẮT LỬA* ✅\n" +
                "Thời gian phát hiện: %s\n" +
                "Thời gian dập: %s\n" +
                "Thời lượng: %d giây\n" +
                "Nhiệt độ cao nhất: %.1f°C\n" +
                "Cảm biến đã kích hoạt: %s",
                fireStartTime.toString(),
                now.toString(),
                durationSeconds,
                maxTempDuringFire != null ? maxTempDuringFire : 0.0,
                lastTriggeredSensors);
        telegramService.sendNotification(msg);

        // WebSocket notify — fire ended
        messagingTemplate.convertAndSend("/topic/alerts",
                FireEventDTO.builder()
                        .id(activeFireEventId)
                        .extinguishedAt(now)
                        .durationSeconds((int) durationSeconds)
                        .build());

        // Reset state
        fireActive = false;
        fireStartTime = null;
        activeFireEventId = null;
        maxTempDuringFire = null;
        lastTriggeredSensors = "";
    }

    private String buildTriggeredSensors(SensorReadingDTO dto) {
        StringBuilder sb = new StringBuilder();
        if (dto.getSensorS0() != null && dto.getSensorS0() == 1) sb.append("S0 ");
        if (dto.getSensorS1() != null && dto.getSensorS1() == 1) sb.append("S1 ");
        if (dto.getSensorS2() != null && dto.getSensorS2() == 1) sb.append("S2 ");
        if (dto.getSensorS3() != null && dto.getSensorS3() == 1) sb.append("S3 ");
        if (dto.getSensorS4() != null && dto.getSensorS4() == 1) sb.append("S4 ");
        if (dto.getSensorS5() != null && dto.getSensorS5() == 1) sb.append("S5 ");
        if (dto.getSensorS6() != null && dto.getSensorS6() == 1) sb.append("S6 ");
        return sb.toString().trim();
    }

    /**
     * Merge 2 triggered sensor strings (ví dụ: "S0 S1" + "S0 S3" = "S0 S1 S3")
     */
    private String mergeTriggeredSensors(String existing, String current) {
        java.util.Set<String> merged = new java.util.LinkedHashSet<>();
        for (String s : existing.split(" ")) {
            if (!s.isEmpty()) merged.add(s);
        }
        for (String s : current.split(" ")) {
            if (!s.isEmpty()) merged.add(s);
        }
        return String.join(" ", merged);
    }

    public void publish(String topic, String payload) {
        log.info("Publishing MQTT message to topic {}: {}", topic, payload);
        mqttOutboundChannel.send(MessageBuilder.withPayload(payload)
                .setHeader(org.springframework.integration.mqtt.support.MqttHeaders.TOPIC, topic)
                .build());
    }
}
