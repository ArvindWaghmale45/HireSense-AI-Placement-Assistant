package com.hiresense.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Long id;
    private String name;
    private String email;
    private String targetRole;
    private List<String> skills;
    private String role;
    private LocalDateTime createdAt;
}
