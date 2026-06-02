package com.ignis.repository;

import com.ignis.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    // 1. Lấy ra 1 bản ghi duy nhất có ID lớn nhất (mới nhất)
    SensorReading findTopByOrderByIdDesc();

    // 2. Lấy toàn bộ danh sách bản ghi sắp xếp theo ID giảm dần
    @Query("SELECT s FROM SensorReading s ORDER BY s.id DESC")
    List<SensorReading> findRecentRecords();

    // 3. THÊM HÀM NÀY: Trả về bản ghi mới nhất để fix lỗi findLatestData()
    @Query(value = "SELECT * FROM sensor_readings ORDER BY id DESC LIMIT 1", nativeQuery = true)
    SensorReading findLatestData();
}
