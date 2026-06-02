package com.ignis.repository;

import com.ignis.entity.FireEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FireEventRepository extends JpaRepository<FireEvent, Long> {

    // Thêm chính xác dòng này để Spring tự hiểu là: SELECT * FROM fire_event ORDER BY id DESC
    List<FireEvent> findAllByOrderByIdDesc();
}
