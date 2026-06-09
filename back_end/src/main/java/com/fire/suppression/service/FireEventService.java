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
        return repository.findAllByOrderByIdDesc().stream()
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

    public FireEventDTO updateEvent(Integer id, FireEventDTO dto) {
        FireEvent entity = repository.findById(id).orElse(null);
        if (entity == null) {
            return saveEvent(dto);
        }
        if (dto.getExtinguishedAt() != null) entity.setExtinguishedAt(dto.getExtinguishedAt());
        if (dto.getMaxTemp() != null) entity.setMaxTemp(dto.getMaxTemp());
        if (dto.getDurationSeconds() != null) entity.setDurationSeconds(dto.getDurationSeconds());
        if (dto.getTriggeredSensors() != null) entity.setTriggeredSensors(dto.getTriggeredSensors());

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
