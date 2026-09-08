package com.example.DailyMoodStressTracker.controller.api;

import com.example.DailyMoodStressTracker.dto.MoodLogRequest;
import com.example.DailyMoodStressTracker.dto.UserDto;
import com.example.DailyMoodStressTracker.model.MoodEntry;
import com.example.DailyMoodStressTracker.model.StudentCase;
import com.example.DailyMoodStressTracker.model.User;
import com.example.DailyMoodStressTracker.repository.UserRepository;
import com.example.DailyMoodStressTracker.service.CaseService;
import com.example.DailyMoodStressTracker.service.MoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
public class ApiStudentController {

    private final MoodService moodService;
    private final CaseService caseService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        User student = getUser(authentication);

        List<MoodEntry> weeklyEntries = moodService.getWeeklyEntries(student);

        List<String> dates = weeklyEntries.stream()
                .map(e -> e.getDate().format(DateTimeFormatter.ofPattern("MMM dd")))
                .collect(Collectors.toList());
        List<Integer> moods = weeklyEntries.stream()
                .map(MoodEntry::getMood)
                .collect(Collectors.toList());
        List<Integer> stressLevels = weeklyEntries.stream()
                .map(MoodEntry::getStressLevel)
                .collect(Collectors.toList());

        Optional<MoodEntry> todayEntry = moodService.getTodayEntry(student);
        Optional<StudentCase> activeCase = caseService.getActiveCase(student);

        Map<String, Object> response = new HashMap<>();
        response.put("student", UserDto.fromEntity(student));
        response.put("weeklyEntries", weeklyEntries);
        response.put("dates", dates);
        response.put("moods", moods);
        response.put("stressLevels", stressLevels);
        response.put("todayEntry", todayEntry.orElse(null));
        response.put("activeCase", activeCase.orElse(null));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/log")
    public ResponseEntity<?> logMood(
            Authentication authentication,
            @RequestBody MoodLogRequest request) {

        User student = getUser(authentication);
        MoodEntry entry = moodService.logMood(student, request.getMood(), request.getNotes() != null ? request.getNotes() : "");

        Optional<StudentCase> activeCase = caseService.getActiveCase(student);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("entry", entry);
        response.put("message", "Mood logged successfully! AI Stress Level: " + entry.getStressLevel() + "/10");
        response.put("activeCase", activeCase.orElse(null));

        return ResponseEntity.ok(response);
    }

    @PostMapping("/submit-problem")
    public ResponseEntity<?> submitProblem(
            Authentication authentication,
            @RequestBody Map<String, String> body) {

        User student = getUser(authentication);
        String problemText = body.getOrDefault("problem", "");
        StudentCase sc = moodService.submitProblem(student, problemText);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Your problem has been submitted and forwarded to your Department HOD and Principal!",
                "activeCase", sc
        ));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
