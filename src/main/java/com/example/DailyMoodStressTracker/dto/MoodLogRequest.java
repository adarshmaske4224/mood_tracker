package com.example.DailyMoodStressTracker.dto;

import lombok.Data;

@Data
public class MoodLogRequest {
    private int mood;
    private String notes;
}
