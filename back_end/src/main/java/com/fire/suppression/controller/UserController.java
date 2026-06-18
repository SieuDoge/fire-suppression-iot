package com.fire.suppression.controller;

import com.fire.suppression.dto.ApiResponse;
import com.fire.suppression.dto.UserDTO;
import com.fire.suppression.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<UserDTO>> getAllUsers() {
        return ApiResponse.success(userService.getAllUsers());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ApiResponse.success("User deleted successfully");
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserDTO> updateUserRole(@PathVariable Integer id, @RequestBody Map<String, String> body) {
        String role = body.get("role");
        return ApiResponse.success(userService.updateRole(id, role));
    }
}
