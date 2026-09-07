package com.hiresense.service;

import com.hiresense.dto.InterviewRequest;
import com.hiresense.model.Interview;
import com.hiresense.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewService {

    private final InterviewRepository interviewRepository;

    @Transactional
    public Interview saveInterview(InterviewRequest req, Long userId) {
        Interview interview = Interview.builder()
                .userId(userId)
                .type(req.getType())
                .difficulty(req.getDifficulty())
                .totalQuestions(req.getTotalQuestions())
                .attempted(req.getAttempted())
                .score(req.getScore())
                .summary(req.getSummary())
                .detailsJson(req.getDetailsJson())
                .createdAt(LocalDateTime.now())
                .build();

        return interviewRepository.save(interview);
    }

    public List<Interview> getUserInterviews(Long userId) {
        return interviewRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
