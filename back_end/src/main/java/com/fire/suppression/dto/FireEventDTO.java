package com.fire.suppression.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class FireEventDTO {
    private Integer id;
    private LocalDateTime detectedAt;
    private LocalDateTime extinguishedAt;
    private Double panAngle;
    private Double tiltAngle;
    private Double maxTemp;
    private Integer durationSeconds;
    private String triggeredSensors;
}
