package com.fire.suppression.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "recorded_at")
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();

    @Column(name = "sensor_s0")
    private Integer sensorS0;

    @Column(name = "sensor_s1")
    private Integer sensorS1;

    @Column(name = "sensor_s2")
    private Integer sensorS2;

    @Column(name = "sensor_s3")
    private Integer sensorS3;

    @Column(name = "sensor_s4")
    private Integer sensorS4;

    @Column(name = "sensor_s5")
    private Integer sensorS5;

    @Column(name = "sensor_s6")
    private Integer sensorS6;

    @Column(name = "ir_temp")
    private Double irTemp;
}
