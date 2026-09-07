package com.hiresense.controller;

import com.hiresense.dto.AuthRequest;
import com.hiresense.dto.AuthResponse;
import com.hiresense.dto.RegisterRequest;
import com.hiresense.dto.UserDto;
import com.hiresense.model.User;
import com.hiresense.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = userService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        try {
            AuthResponse response = userService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        UserDto dto = userService.getProfile(user.getEmail());
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserDto request
    ) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        UserDto updated = userService.updateProfile(user.getEmail(), request);
        return ResponseEntity.ok(updated);
    }
}
