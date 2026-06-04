package com.fire.suppression.repository;

import com.fire.suppression.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Integer> {

    SensorReading findTopByOrderByIdDesc();

    @Query("SELECT s FROM SensorReading s ORDER BY s.id DESC")
    List<SensorReading> findRecentRecords();

    @Query(value = "SELECT * FROM sensor_readings ORDER BY id DESC LIMIT 1", nativeQuery = true)
    SensorReading findLatestData();
}
