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
    private Integer tiltSensor;
    private Double panAngle;
    private Integer tiltAngle;
    private Boolean pump;
    private Double tempAmbient;
    private Double tempObject;
}
