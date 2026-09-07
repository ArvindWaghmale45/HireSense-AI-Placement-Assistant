package com.hiresense.controller;

import com.hiresense.dto.InterviewRequest;
import com.hiresense.model.Interview;
import com.hiresense.model.User;
import com.hiresense.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/interviews")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @GetMapping
    public ResponseEntity<?> getInterviews(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", "Not authenticated"));
        }
        List<Interview> interviews = interviewService.getUserInterviews(user.getId());
        return ResponseEntity.ok(interviews);
    }

    @PostMapping
    public ResponseEntity<?> createInterview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody InterviewRequest request
    ) {
        Long userId = (user != null) ? user.getId() : request.getUserId();
        if (userId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "User ID is required"));
        }

        Interview saved = interviewService.saveInterview(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
