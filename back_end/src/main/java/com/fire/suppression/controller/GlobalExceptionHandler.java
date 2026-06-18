package com.fire.suppression.controller;

import com.fire.suppression.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<String> handleBadCredentials(BadCredentialsException e) {
        return ApiResponse.error("Invalid username or password");
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<String> handleAccessDenied(AccessDeniedException e) {
        return ApiResponse.error("Access denied. Admin privileges required.");
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<String> handleRuntimeException(RuntimeException e) {
        log.error("Runtime exception: {}", e.getMessage(), e);
        return ApiResponse.error(e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<String> handleGenericException(Exception e) {
        log.error("Unexpected error: {}", e.getMessage(), e);
        return ApiResponse.error("Internal server error");
    }
}
