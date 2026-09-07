package com.hiresense.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String type; // TECHNICAL or HR

    @Column(nullable = false)
    private String difficulty; // EASY, MEDIUM, HARD

    private int totalQuestions;

    private int attempted;

    private int score; // 1-10

    @Column(length = 2000)
    private String summary;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String detailsJson; // JSON representation of question & answer evaluations

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
