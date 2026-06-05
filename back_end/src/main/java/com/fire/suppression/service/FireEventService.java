package com.fire.suppression.service;

import com.fire.suppression.dto.FireEventDTO;
import com.fire.suppression.entity.FireEvent;
import com.fire.suppression.repository.FireEventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@org.springframework.transaction.annotation.Transactional
public class FireEventService {
    private final FireEventRepository repository;

    public List<FireEventDTO> getAllEvents() {
        return repository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public FireEventDTO saveEvent(FireEventDTO dto) {
        FireEvent entity = FireEvent.builder()
                .detectedAt(dto.getDetectedAt())
                .extinguishedAt(dto.getExtinguishedAt())
                .panAngle(dto.getPanAngle())
                .tiltAngle(dto.getTiltAngle())
                .maxTemp(dto.getMaxTemp())
                .durationSeconds(dto.getDurationSeconds())
                .triggeredSensors(dto.getTriggeredSensors())
                .build();
        
        FireEvent saved = repository.save(entity);
        return mapToDTO(saved);
    }

    private FireEventDTO mapToDTO(FireEvent entity) {
        return FireEventDTO.builder()
                .id(entity.getId())
                .detectedAt(entity.getDetectedAt())
                .extinguishedAt(entity.getExtinguishedAt())
                .panAngle(entity.getPanAngle())
                .tiltAngle(entity.getTiltAngle())
                .maxTemp(entity.getMaxTemp())
                .durationSeconds(entity.getDurationSeconds())
                .triggeredSensors(entity.getTriggeredSensors())
                .build();
    }
}
