package com.example.DailyMoodStressTracker.controller;

import com.example.DailyMoodStressTracker.model.*;
import com.example.DailyMoodStressTracker.repository.DepartmentRepository;
import com.example.DailyMoodStressTracker.repository.UserRepository;
import com.example.DailyMoodStressTracker.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/principal")
@RequiredArgsConstructor
public class PrincipalController {

    private final CaseService caseService;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        User principal = getUser(authentication);

        List<Department> departments = departmentRepository.findAll();
        List<StudentCase> allActiveCases = caseService.getAllActiveCases();
        List<StudentCase> allCases = caseService.getAllCases();

        Map<String, Map<String, Long>> departmentStats = caseService.getDepartmentStats(departments);

        long totalStudents = userRepository.findAllByRole(Role.STUDENT).size();
        long totalFlagged = allActiveCases.stream().filter(c -> c.getStatus() == CaseStatus.FLAGGED).count();
        long totalInProgress = allActiveCases.stream().filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS || c.getStatus() == CaseStatus.ASSIGNED).count();
        long totalResolved = allCases.stream().filter(c -> c.getStatus() == CaseStatus.RESOLVED).count();

        model.addAttribute("principal", principal);
        model.addAttribute("departments", departments);
        model.addAttribute("departmentStats", departmentStats);
        model.addAttribute("allActiveCases", allActiveCases);
        model.addAttribute("totalStudents", totalStudents);
        model.addAttribute("totalFlagged", totalFlagged);
        model.addAttribute("totalInProgress", totalInProgress);
        model.addAttribute("totalResolved", totalResolved);

        return "principal/dashboard";
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
