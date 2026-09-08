package com.example.DailyMoodStressTracker.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "mood_entries", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"student_id", "date"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MoodEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private LocalDate date;

    // 1 = Awful, 2 = Low, 3 = Okay, 4 = Good, 5 = Great
    @Column(nullable = false)
    private int mood;

    // 1 = Minimal stress, 10 = Extreme stress (AI-calculated)
    @Column(nullable = false)
    private int stressLevel;

    // Student's free-text input (analyzed by AI for stress)
    @Column(columnDefinition = "TEXT")
    private String notes;

    // AI analysis summary
    @Column(columnDefinition = "TEXT")
    private String aiAnalysis;
}
