package com.fire.suppression.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
