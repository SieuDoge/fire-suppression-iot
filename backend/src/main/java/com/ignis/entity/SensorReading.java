package com.ignis.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_readings")
public class SensorReading {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "recorded_at")
    private LocalDateTime recordedAt = LocalDateTime.now();

    @Column(name = "sensor_n")
    private Integer sensorN;

    @Column(name = "sensor_s")
    private Integer sensorS;

    @Column(name = "sensor_e")
    private Integer sensorE;

    @Column(name = "sensor_w")
    private Integer sensorW;

    @Column(name = "ir_temp")
    private Double irTemp;

    public SensorReading() {}

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public LocalDateTime getRecordedAt() { return recordedAt; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }
    public Integer getSensorN() { return sensorN; }
    public void setSensorN(Integer sensorN) { this.sensorN = sensorN; }
    public Integer getSensorS() { return sensorS; }
    public void setSensorS(Integer sensorS) { this.sensorS = sensorS; }
    public Integer getSensorE() { return sensorE; }
    public void setSensorE(Integer sensorE) { this.sensorE = sensorE; }
    public Integer getSensorW() { return sensorW; }
    public void setSensorW(Integer sensorW) { this.sensorW = sensorW; }
    public Double getIrTemp() { return irTemp; }
    public void setIrTemp(Double irTemp) { this.irTemp = irTemp; }
}
