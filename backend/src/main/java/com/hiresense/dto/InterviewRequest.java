package com.hiresense.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewRequest {

    private Long userId;

    @NotBlank(message = "Type is required")
    private String type; // TECHNICAL or HR

    @NotBlank(message = "Difficulty is required")
    private String difficulty; // EASY, MEDIUM, HARD

    private int totalQuestions;

    private int attempted;

    private int score;

    private String summary;

    private String detailsJson;
}
