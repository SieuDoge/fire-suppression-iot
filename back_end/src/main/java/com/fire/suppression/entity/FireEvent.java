package com.fire.suppression.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "fire_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FireEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "detected_at", nullable = false)
    @Builder.Default
    private LocalDateTime detectedAt = LocalDateTime.now();

    @Column(name = "extinguished_at")
    private LocalDateTime extinguishedAt;

    @Column(name = "pan_angle")
    private Double panAngle;

    @Column(name = "tilt_angle")
    private Double tiltAngle;

    @Column(name = "max_temp")
    private Double maxTemp;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(name = "triggered_sensors", length = 50)
    private String triggeredSensors;
}
