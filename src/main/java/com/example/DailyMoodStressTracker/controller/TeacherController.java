package com.example.DailyMoodStressTracker.controller;

import com.example.DailyMoodStressTracker.model.*;
import com.example.DailyMoodStressTracker.repository.UserRepository;
import com.example.DailyMoodStressTracker.service.CaseService;
import com.example.DailyMoodStressTracker.service.MoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final CaseService caseService;
    private final MoodService moodService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        User teacher = getUser(authentication);

        List<StudentCase> activeCases = caseService.getAssignedCases(teacher);
        List<StudentCase> allCases = caseService.getAllTeacherCases(teacher);

        model.addAttribute("teacher", teacher);
        model.addAttribute("activeCases", activeCases);
        model.addAttribute("allCases", allCases);

        return "teacher/dashboard";
    }

    @GetMapping("/student/{caseId}")
    public String studentDetail(@PathVariable Long caseId, Authentication authentication, Model model) {
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

        model.addAttribute("teacher", teacher);
        model.addAttribute("studentCase", studentCase);
        model.addAttribute("student", student);
        model.addAttribute("weeklyEntries", weeklyEntries);
        model.addAttribute("dates", dates);
        model.addAttribute("moods", moods);
        model.addAttribute("stressLevels", stressLevels);
        model.addAttribute("moodLabels", new String[]{"", "😢 Awful", "😟 Low", "😐 Okay", "🙂 Good", "😄 Great"});

        return "teacher/student-detail";
    }

    @PostMapping("/solution/{caseId}")
    public String provideSolution(
            @PathVariable Long caseId,
            @RequestParam String solution,
            Authentication authentication,
            RedirectAttributes redirectAttributes) {

        User teacher = getUser(authentication);
        caseService.provideSolution(caseId, solution, teacher);

        redirectAttributes.addFlashAttribute("success", "Solution provided! 7-day mood tracking started.");
        return "redirect:/teacher/student/" + caseId;
    }

    @PostMapping("/resolve/{caseId}")
    public String resolveCase(
            @PathVariable Long caseId,
            Authentication authentication,
            RedirectAttributes redirectAttributes) {

        User teacher = getUser(authentication);
        caseService.resolveCase(caseId, teacher);

        redirectAttributes.addFlashAttribute("success", "Case resolved successfully!");
        return "redirect:/teacher/dashboard";
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
