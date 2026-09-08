package com.example.DailyMoodStressTracker.controller;

import com.example.DailyMoodStressTracker.model.Department;
import com.example.DailyMoodStressTracker.model.Role;
import com.example.DailyMoodStressTracker.model.User;
import com.example.DailyMoodStressTracker.repository.DepartmentRepository;
import com.example.DailyMoodStressTracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        List<Department> departments = departmentRepository.findAll();
        model.addAttribute("departments", departments);
        return "register";
    }

    @PostMapping("/register")
    public String registerStudent(
            @RequestParam String fullName,
            @RequestParam String rollNumber,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam Long departmentId,
            RedirectAttributes redirectAttributes) {

        // Validate unique username
        if (userRepository.existsByUsername(username)) {
            redirectAttributes.addFlashAttribute("error", "Username already taken!");
            return "redirect:/register";
        }

        // Validate unique roll number
        if (userRepository.existsByRollNumber(rollNumber)) {
            redirectAttributes.addFlashAttribute("error", "Roll number already registered!");
            return "redirect:/register";
        }

        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));

        User student = User.builder()
                .fullName(fullName)
                .rollNumber(rollNumber)
                .phoneNumber(phoneNumber)
                .username(username)
                .password(passwordEncoder.encode(password))
                .role(Role.STUDENT)
                .department(department)
                .build();

        userRepository.save(student);

        redirectAttributes.addFlashAttribute("success", "Registration successful! Please login.");
        return "redirect:/login";
    }

    @GetMapping("/")
    public String redirectToDashboard(Authentication authentication) {
        if (authentication == null) {
            return "redirect:/login";
        }

        var authorities = authentication.getAuthorities();
        for (var authority : authorities) {
            String role = authority.getAuthority();
            switch (role) {
                case "ROLE_STUDENT":
                    return "redirect:/student/dashboard";
                case "ROLE_TEACHER":
                    return "redirect:/teacher/dashboard";
                case "ROLE_HOD":
                    return "redirect:/hod/dashboard";
                case "ROLE_PRINCIPAL":
                    return "redirect:/principal/dashboard";
            }
        }
        return "redirect:/login";
    }
}
