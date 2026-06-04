package com.fire.suppression.controller;

import com.fire.suppression.dto.ApiResponse;
import com.fire.suppression.dto.FireEventDTO;
import com.fire.suppression.service.FireEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fire-events")
@RequiredArgsConstructor
public class FireEventController {
    private final FireEventService fireEventService;

    @GetMapping
    public ApiResponse<List<FireEventDTO>> getAllEvents() {
        return ApiResponse.success(fireEventService.getAllEvents());
    }

    @PostMapping
    public ApiResponse<FireEventDTO> addEvent(@RequestBody FireEventDTO dto) {
        return ApiResponse.success(fireEventService.saveEvent(dto));
    }
}
