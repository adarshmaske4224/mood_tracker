package com.example.DailyMoodStressTracker.service;

import com.example.DailyMoodStressTracker.model.*;
import com.example.DailyMoodStressTracker.repository.MoodEntryRepository;
import com.example.DailyMoodStressTracker.repository.StudentCaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MoodService {

    private final MoodEntryRepository moodEntryRepository;
    private final StudentCaseRepository studentCaseRepository;
    private final StressAnalyzerService stressAnalyzerService;

    private static final int STRESS_THRESHOLD = 7;
    private static final int CONSECUTIVE_DAYS_THRESHOLD = 3;

    /**
     * Log mood entry for today. AI analyzes the text to calculate stress.
     */
    @Transactional
    public MoodEntry logMood(User student, int mood, String notes) {
        LocalDate today = LocalDate.now();

        // AI stress analysis
        StressAnalyzerService.StressResult stressResult = stressAnalyzerService.analyzeStress(notes, mood);

        // Check if entry already exists for today
        Optional<MoodEntry> existing = moodEntryRepository.findByStudentAndDate(student, today);

        MoodEntry entry;
        if (existing.isPresent()) {
            entry = existing.get();
            entry.setMood(mood);
            entry.setStressLevel(stressResult.stressLevel());
            entry.setNotes(notes);
            entry.setAiAnalysis(stressResult.analysis());
        } else {
            entry = MoodEntry.builder()
                    .student(student)
                    .date(today)
                    .mood(mood)
                    .stressLevel(stressResult.stressLevel())
                    .notes(notes)
                    .aiAnalysis(stressResult.analysis())
                    .build();
        }

        entry = moodEntryRepository.save(entry);

        // Check if student should be flagged
        checkAndFlagStudent(student);

        return entry;
    }

    /**
     * Get weekly mood entries (last 7 days).
     */
    public List<MoodEntry> getWeeklyEntries(User student) {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);
        return moodEntryRepository.findByStudentAndDateBetweenOrderByDateAsc(student, start, end);
    }

    /**
     * Get mood entries for a specific date range.
     */
    public List<MoodEntry> getEntriesBetween(User student, LocalDate start, LocalDate end) {
        return moodEntryRepository.findByStudentAndDateBetweenOrderByDateAsc(student, start, end);
    }

    /**
     * Check consecutive high-stress days and auto-flag student if threshold met.
     */
    @Transactional
    public void checkAndFlagStudent(User student) {
        // Don't flag if there's already an active case
        boolean hasActiveCase = studentCaseRepository.existsByStudentAndStatusIn(
                student,
                List.of(CaseStatus.FLAGGED, CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS)
        );

        if (hasActiveCase) {
            return;
        }

        // Get recent entries
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(CONSECUTIVE_DAYS_THRESHOLD - 1);
        List<MoodEntry> recentEntries = moodEntryRepository
                .findByStudentAndDateBetweenOrderByDateAsc(student, start, today);

        // Check for consecutive high-stress days
        if (recentEntries.size() >= CONSECUTIVE_DAYS_THRESHOLD) {
            int consecutiveHighStress = 0;
            for (int i = recentEntries.size() - 1; i >= 0; i--) {
                if (recentEntries.get(i).getStressLevel() >= STRESS_THRESHOLD) {
                    consecutiveHighStress++;
                } else {
                    break;
                }
            }

            if (consecutiveHighStress >= CONSECUTIVE_DAYS_THRESHOLD) {
                // Create a flagged case
                StudentCase newCase = StudentCase.builder()
                        .student(student)
                        .status(CaseStatus.FLAGGED)
                        .stressStreakDays(consecutiveHighStress)
                        .build();
                studentCaseRepository.save(newCase);
            }
        }
    }

    /**
     * Get today's entry for a student.
     */
    public Optional<MoodEntry> getTodayEntry(User student) {
        return moodEntryRepository.findByStudentAndDate(student, LocalDate.now());
    }
}
