package com.example.DailyMoodStressTracker.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String fullName;
    private String rollNumber;
    private String username;
    private String password;
    private Long departmentId;
}
