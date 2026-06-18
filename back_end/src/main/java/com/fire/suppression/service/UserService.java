package com.fire.suppression.service;

import com.fire.suppression.dto.UserDTO;
import com.fire.suppression.entity.User;
import com.fire.suppression.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {
    private final UserRepository userRepository;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Prevent deleting the last admin
        if ("admin".equalsIgnoreCase(user.getRole())) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> "admin".equalsIgnoreCase(u.getRole()))
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last admin user");
            }
        }
        userRepository.deleteById(id);
    }

    public UserDTO updateRole(Integer id, String role) {
        if (!"admin".equalsIgnoreCase(role) && !"viewer".equalsIgnoreCase(role)) {
            throw new RuntimeException("Invalid role. Must be 'admin' or 'viewer'");
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        // Prevent removing the last admin
        if ("admin".equalsIgnoreCase(user.getRole()) && "viewer".equalsIgnoreCase(role)) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> "admin".equalsIgnoreCase(u.getRole()))
                    .count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot demote the last admin user");
            }
        }
        user.setRole(role.toLowerCase());
        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
