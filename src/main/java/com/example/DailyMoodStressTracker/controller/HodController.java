package com.example.DailyMoodStressTracker.controller;

import com.example.DailyMoodStressTracker.model.*;
import com.example.DailyMoodStressTracker.repository.UserRepository;
import com.example.DailyMoodStressTracker.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequestMapping("/hod")
@RequiredArgsConstructor
public class HodController {

    private final CaseService caseService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public String dashboard(Authentication authentication, Model model) {
        User hod = getUser(authentication);
        Department dept = hod.getDepartment();

        List<StudentCase> activeCases = caseService.getCasesForDepartment(dept);
        List<StudentCase> allCases = caseService.getAllCasesForDepartment(dept);
        List<User> teachers = caseService.getTeachersInDepartment(dept);

        long flaggedCount = activeCases.stream().filter(c -> c.getStatus() == CaseStatus.FLAGGED).count();
        long assignedCount = activeCases.stream().filter(c -> c.getStatus() == CaseStatus.ASSIGNED).count();
        long inProgressCount = activeCases.stream().filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS).count();
        long resolvedCount = allCases.stream().filter(c -> c.getStatus() == CaseStatus.RESOLVED).count();

        model.addAttribute("hod", hod);
        model.addAttribute("department", dept);
        model.addAttribute("activeCases", activeCases);
        model.addAttribute("allCases", allCases);
        model.addAttribute("teachers", teachers);
        model.addAttribute("flaggedCount", flaggedCount);
        model.addAttribute("assignedCount", assignedCount);
        model.addAttribute("inProgressCount", inProgressCount);
        model.addAttribute("resolvedCount", resolvedCount);

        return "hod/dashboard";
    }

    @PostMapping("/assign/{caseId}")
    public String assignTeacher(
            @PathVariable Long caseId,
            @RequestParam Long teacherId,
            Authentication authentication,
            RedirectAttributes redirectAttributes) {

        User hod = getUser(authentication);
        caseService.assignTeacher(caseId, teacherId, hod);

        redirectAttributes.addFlashAttribute("success", "Student assigned to teacher successfully!");
        return "redirect:/hod/dashboard";
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
