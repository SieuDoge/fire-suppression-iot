package com.fire.suppression.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserDTO {
    private Integer id;
    private String username;
    private String role;
    private LocalDateTime createdAt;
}
