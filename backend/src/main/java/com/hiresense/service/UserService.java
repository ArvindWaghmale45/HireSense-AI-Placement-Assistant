package com.hiresense.service;

import com.hiresense.dto.AuthRequest;
import com.hiresense.dto.AuthResponse;
import com.hiresense.dto.RegisterRequest;
import com.hiresense.dto.UserDto;
import com.hiresense.model.User;
import com.hiresense.repository.UserRepository;
import com.hiresense.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().trim().toLowerCase())) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        List<String> defaultSkills = req.getSkills() != null && !req.getSkills().isEmpty()
                ? req.getSkills()
                : Arrays.asList("Java", "SQL", "OOP", "Data Structures");

        User user = User.builder()
                .name(req.getName().trim())
                .email(req.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .targetRole(req.getTargetRole() != null ? req.getTargetRole().trim() : "Software Engineer")
                .skills(defaultSkills)
                .role("ROLE_USER")
                .build();

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(toDto(saved))
                .build();
    }

    public AuthResponse login(AuthRequest req) {
        User user = userRepository.findByEmail(req.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .user(toDto(user))
                .build();
    }

    public UserDto getProfile(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
        return toDto(user);
    }

    public UserDto toDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .targetRole(user.getTargetRole())
                .skills(user.getSkills())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
