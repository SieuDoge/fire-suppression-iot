package com.fire.suppression.controller;

import com.fire.suppression.dto.ApiResponse;
import com.fire.suppression.dto.JwtResponse;
import com.fire.suppression.dto.LoginRequest;
import com.fire.suppression.dto.RegisterRequest;
import com.fire.suppression.entity.User;
import com.fire.suppression.repository.UserRepository;
import com.fire.suppression.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ApiResponse<JwtResponse> authenticateUser(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(userDetails);
        
        String role = userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");

        return ApiResponse.success(new JwtResponse(jwt, userDetails.getUsername(), role));
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<String> registerUser(@RequestBody RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ApiResponse.error("Username already exists");
        }
        User user = User.builder()
                .username(request.getUsername())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role("viewer")
                .build();
        userRepository.save(user);
        return ApiResponse.success("User registered successfully");
    }
}
