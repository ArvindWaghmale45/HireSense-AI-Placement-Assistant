package com.hiresense.config;

import com.hiresense.model.User;
import com.hiresense.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String demoEmail = "candidate@example.com";
        if (!userRepository.existsByEmail(demoEmail)) {
            User demoUser = User.builder()
                    .name("Arvind Waghmale")
                    .email(demoEmail)
                    .password(passwordEncoder.encode("password123"))
                    .targetRole("Full Stack Java Developer")
                    .skills(Arrays.asList("Java", "Spring Boot", "SQL", "React", "Data Structures"))
                    .role("ROLE_USER")
                    .build();

            userRepository.save(demoUser);
            log.info("Initialized default demo candidate: {} (password: password123)", demoEmail);
        }
    }
}
