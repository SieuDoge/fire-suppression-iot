package com.fire.suppression.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SensorReadingDTO {
    private Integer id;
    private LocalDateTime recordedAt;
    private Integer sensorS0;
    private Integer sensorS1;
    private Integer sensorS2;
    private Integer sensorS3;
    private Integer sensorS4;
    private Integer sensorS5;
    private Integer sensorS6;
    private Double irTemp;
}
