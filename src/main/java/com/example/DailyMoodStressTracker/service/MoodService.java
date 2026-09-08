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

        // Immediately route student's problem to HOD and Principal dashboards
        handleProblemCase(student, entry, notes);

        return entry;
    }

    /**
     * Submit an explicit problem description directly to HOD and Principal.
     */
    @Transactional
    public StudentCase submitProblem(User student, String problemText) {
        Optional<StudentCase> activeOpt = studentCaseRepository.findByStudentAndStatusIn(
                student,
                List.of(CaseStatus.FLAGGED, CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS)
        );

        if (activeOpt.isPresent()) {
            StudentCase existing = activeOpt.get();
            existing.setProblemDescription(problemText);
            return studentCaseRepository.save(existing);
        }

        StudentCase newCase = StudentCase.builder()
                .student(student)
                .status(CaseStatus.FLAGGED)
                .stressStreakDays(Math.max(1, calculateStressStreak(student)))
                .problemDescription(problemText)
                .build();
        return studentCaseRepository.save(newCase);
    }

    private String getMoodName(int mood) {
        return switch (mood) {
            case 1 -> "Awful (1/5)";
            case 2 -> "Low (2/5)";
            case 3 -> "Okay (3/5)";
            case 4 -> "Good (4/5)";
            case 5 -> "Great (5/5)";
            default -> "Mood Level " + mood;
        };
    }

    private int calculateStressStreak(User student) {
        LocalDate today = LocalDate.now();
        LocalDate start = today.minusDays(6);
        List<MoodEntry> recent = moodEntryRepository.findByStudentAndDateBetweenOrderByDateAsc(student, start, today);
        if (recent.isEmpty()) return 1;
        int streak = 0;
        for (int i = recent.size() - 1; i >= 0; i--) {
            if (recent.get(i).getStressLevel() >= 4 || recent.get(i).getMood() <= 3) {
                streak++;
            } else {
                break;
            }
        }
        return Math.max(1, streak);
    }

    /**
     * Immediately create or update StudentCase so it appears on HOD and Principal dashboards.
     */
    @Transactional
    public void handleProblemCase(User student, MoodEntry entry, String notes) {
        Optional<StudentCase> existingActive = studentCaseRepository.findByStudentAndStatusIn(
                student,
                List.of(CaseStatus.FLAGGED, CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS)
        );

        String problemText = (notes != null && !notes.trim().isEmpty())
                ? notes.trim()
                : "Student reported " + getMoodName(entry.getMood()) + " with AI Stress Level " + entry.getStressLevel() + "/10.";

        if (existingActive.isPresent()) {
            StudentCase activeCase = existingActive.get();
            if (notes != null && !notes.trim().isEmpty()) {
                activeCase.setProblemDescription(notes.trim());
            }
            if (activeCase.getStatus() == CaseStatus.FLAGGED) {
                activeCase.setStressStreakDays(calculateStressStreak(student));
            }
            studentCaseRepository.save(activeCase);
            return;
        }

        // Create new FLAGGED case for HOD and Principal review
        StudentCase newCase = StudentCase.builder()
                .student(student)
                .status(CaseStatus.FLAGGED)
                .stressStreakDays(calculateStressStreak(student))
                .problemDescription(problemText)
                .build();
        studentCaseRepository.save(newCase);
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
     * Check consecutive high-stress days and auto-flag student.
     */
    @Transactional
    public void checkAndFlagStudent(User student) {
        Optional<MoodEntry> today = getTodayEntry(student);
        today.ifPresent(moodEntry -> handleProblemCase(student, moodEntry, moodEntry.getNotes()));
    }

    /**
     * Get today's entry for a student.
     */
    public Optional<MoodEntry> getTodayEntry(User student) {
        return moodEntryRepository.findByStudentAndDate(student, LocalDate.now());
    }
}
