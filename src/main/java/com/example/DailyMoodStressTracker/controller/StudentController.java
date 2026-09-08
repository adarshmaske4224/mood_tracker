package com.example.DailyMoodStressTracker.controller;

import com.example.DailyMoodStressTracker.model.MoodEntry;
import com.example.DailyMoodStressTracker.model.StudentCase;
import com.example.DailyMoodStressTracker.model.User;
import com.example.DailyMoodStressTracker.repository.UserRepository;
import com.example.DailyMoodStressTracker.service.CaseService;
import com.example.DailyMoodStressTracker.service.MoodService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Controller
@RequestMapping("/student")
@RequiredArgsConstructor
public class StudentController {

    private final MoodService moodService;
    private final CaseService caseService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        User student = getUser(authentication);

        // Get weekly entries for chart
        List<MoodEntry> weeklyEntries = moodService.getWeeklyEntries(student);

        // Prepare chart data
        List<String> dates = weeklyEntries.stream()
                .map(e -> e.getDate().format(DateTimeFormatter.ofPattern("MMM dd")))
                .collect(Collectors.toList());
        List<Integer> moods = weeklyEntries.stream()
                .map(MoodEntry::getMood)
                .collect(Collectors.toList());
        List<Integer> stressLevels = weeklyEntries.stream()
                .map(MoodEntry::getStressLevel)
                .collect(Collectors.toList());

        // Get today's entry if exists
        Optional<MoodEntry> todayEntry = moodService.getTodayEntry(student);

        // Get active case if any
        Optional<StudentCase> activeCase = caseService.getActiveCase(student);

        model.addAttribute("student", student);
        model.addAttribute("weeklyEntries", weeklyEntries);
        model.addAttribute("dates", dates);
        model.addAttribute("moods", moods);
        model.addAttribute("stressLevels", stressLevels);
        model.addAttribute("todayEntry", todayEntry.orElse(null));
        model.addAttribute("activeCase", activeCase.orElse(null));
        model.addAttribute("moodLabels", new String[]{"", "😢 Awful", "😟 Low", "😐 Okay", "🙂 Good", "😄 Great"});

        return "student/dashboard";
    }

    @PostMapping("/log")
    public String logMood(
            Authentication authentication,
            @RequestParam int mood,
            @RequestParam(required = false, defaultValue = "") String notes,
            RedirectAttributes redirectAttributes) {

        User student = getUser(authentication);
        MoodEntry entry = moodService.logMood(student, mood, notes);

        redirectAttributes.addFlashAttribute("success", "Mood logged successfully! AI Stress Level: " + entry.getStressLevel() + "/10");
        return "redirect:/student/dashboard";
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
