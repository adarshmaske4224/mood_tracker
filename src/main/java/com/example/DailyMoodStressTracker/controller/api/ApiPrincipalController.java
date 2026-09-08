package com.example.DailyMoodStressTracker.controller.api;

import com.example.DailyMoodStressTracker.dto.UserDto;
import com.example.DailyMoodStressTracker.model.*;
import com.example.DailyMoodStressTracker.repository.DepartmentRepository;
import com.example.DailyMoodStressTracker.repository.UserRepository;
import com.example.DailyMoodStressTracker.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/principal")
@RequiredArgsConstructor
public class ApiPrincipalController {

    private final CaseService caseService;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        User principal = getUser(authentication);

        List<Department> departments = departmentRepository.findAll();
        List<StudentCase> allActiveCases = caseService.getAllActiveCases();
        List<StudentCase> allCases = caseService.getAllCases();

        Map<String, Map<String, Long>> departmentStats = caseService.getDepartmentStats(departments);

        long totalStudents = userRepository.findAllByRole(Role.STUDENT).size();
        long totalFlagged = allActiveCases.stream().filter(c -> c.getStatus() == CaseStatus.FLAGGED).count();
        long totalInProgress = allActiveCases.stream().filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS || c.getStatus() == CaseStatus.ASSIGNED).count();
        long totalResolved = allCases.stream().filter(c -> c.getStatus() == CaseStatus.RESOLVED).count();

        Map<String, Object> response = new HashMap<>();
        response.put("principal", UserDto.fromEntity(principal));
        response.put("departments", departments);
        response.put("departmentStats", departmentStats);
        response.put("allActiveCases", allActiveCases);
        response.put("totalStudents", totalStudents);
        response.put("totalFlagged", totalFlagged);
        response.put("totalInProgress", totalInProgress);
        response.put("totalResolved", totalResolved);

        return ResponseEntity.ok(response);
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
