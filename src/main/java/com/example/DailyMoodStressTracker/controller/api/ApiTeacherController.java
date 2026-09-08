package com.example.DailyMoodStressTracker.controller.api;

import com.example.DailyMoodStressTracker.dto.SolutionRequest;
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
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class ApiTeacherController {

    private final CaseService caseService;
    private final MoodService moodService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        User teacher = getUser(authentication);

        List<StudentCase> activeCases = caseService.getAssignedCases(teacher);
        List<StudentCase> allCases = caseService.getAllTeacherCases(teacher);

        Map<String, Object> response = new HashMap<>();
        response.put("teacher", UserDto.fromEntity(teacher));
        response.put("activeCases", activeCases);
        response.put("allCases", allCases);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/student/{caseId}")
    public ResponseEntity<?> getStudentDetail(@PathVariable Long caseId, Authentication authentication) {
        User teacher = getUser(authentication);

        StudentCase studentCase = caseService.getAssignedCases(teacher).stream()
                .filter(c -> c.getId().equals(caseId))
                .findFirst()
                .orElse(caseService.getAllTeacherCases(teacher).stream()
                        .filter(c -> c.getId().equals(caseId))
                        .findFirst()
                        .orElseThrow(() -> new RuntimeException("Case not found or not assigned to you")));

        User student = studentCase.getStudent();
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

        Map<String, Object> response = new HashMap<>();
        response.put("studentCase", studentCase);
        response.put("student", UserDto.fromEntity(student));
        response.put("weeklyEntries", weeklyEntries);
        response.put("dates", dates);
        response.put("moods", moods);
        response.put("stressLevels", stressLevels);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/solution/{caseId}")
    public ResponseEntity<?> provideSolution(
            @PathVariable Long caseId,
            @RequestBody SolutionRequest request,
            Authentication authentication) {

        User teacher = getUser(authentication);
        caseService.provideSolution(caseId, request.getSolution(), teacher);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Solution provided! 7-day mood tracking started."
        ));
    }

    @PostMapping("/resolve/{caseId}")
    public ResponseEntity<?> resolveCase(
            @PathVariable Long caseId,
            Authentication authentication) {

        User teacher = getUser(authentication);
        caseService.resolveCase(caseId, teacher);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Case resolved successfully!"
        ));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
