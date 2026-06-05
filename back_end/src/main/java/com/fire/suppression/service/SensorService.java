package com.fire.suppression.service;

import com.fire.suppression.dto.SensorReadingDTO;
import com.fire.suppression.entity.SensorReading;
import com.fire.suppression.repository.SensorReadingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class SensorService {
    private final SensorReadingRepository repository;

    public SensorReadingDTO saveReading(SensorReadingDTO dto) {
        SensorReading entity = SensorReading.builder()
                .sensorS0(dto.getSensorS0())
                .sensorS1(dto.getSensorS1())
                .sensorS2(dto.getSensorS2())
                .sensorS3(dto.getSensorS3())
                .sensorS4(dto.getSensorS4())
                .sensorS5(dto.getSensorS5())
                .sensorS6(dto.getSensorS6())
                .irTemp(dto.getIrTemp())
                .build();
        
        SensorReading saved = repository.save(entity);
        return mapToDTO(saved);
    }

    public List<SensorReadingDTO> getLatestReadings(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "recordedAt"));
        return repository.findAll(pageable).getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private SensorReadingDTO mapToDTO(SensorReading entity) {
        return SensorReadingDTO.builder()
                .id(entity.getId())
                .recordedAt(entity.getRecordedAt())
                .sensorS0(entity.getSensorS0())
                .sensorS1(entity.getSensorS1())
                .sensorS2(entity.getSensorS2())
                .sensorS3(entity.getSensorS3())
                .sensorS4(entity.getSensorS4())
                .sensorS5(entity.getSensorS5())
                .sensorS6(entity.getSensorS6())
                .irTemp(entity.getIrTemp())
                .build();
    }
}
