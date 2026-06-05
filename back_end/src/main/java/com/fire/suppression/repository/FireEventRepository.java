package com.fire.suppression.repository;

import com.fire.suppression.entity.FireEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FireEventRepository extends JpaRepository<FireEvent, Integer> {

    List<FireEvent> findAllByOrderByIdDesc();
}
