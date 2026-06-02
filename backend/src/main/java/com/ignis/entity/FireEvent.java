package com.ignis.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "fire_events")
public class FireEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "detected_at", nullable = false)
    private LocalDateTime detectedAt;

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

    @Column(name = "triggered_sensors", length = 20)
    private String triggeredSensors;

    public FireEvent() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public LocalDateTime getDetectedAt() { return detectedAt; }
    public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }
    public LocalDateTime getExtinguishedAt() { return extinguishedAt; }
    public void setExtinguishedAt(LocalDateTime extinguishedAt) { this.extinguishedAt = extinguishedAt; }
    public Double getPanAngle() { return panAngle; }
    public void setPanAngle(Double panAngle) { this.panAngle = panAngle; }
    public Double getTiltAngle() { return tiltAngle; }
    public void setTiltAngle(Double tiltAngle) { this.tiltAngle = tiltAngle; }
    public Double getMaxTemp() { return maxTemp; }
    public void setMaxTemp(Double maxTemp) { this.maxTemp = maxTemp; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getTriggeredSensors() { return triggeredSensors; }
    public void setTriggeredSensors(String triggeredSensors) { this.triggeredSensors = triggeredSensors; }
}
