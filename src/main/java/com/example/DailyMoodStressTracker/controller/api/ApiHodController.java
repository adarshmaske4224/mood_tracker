package com.example.DailyMoodStressTracker.controller.api;

import com.example.DailyMoodStressTracker.dto.AssignTeacherRequest;
import com.example.DailyMoodStressTracker.dto.UserDto;
import com.example.DailyMoodStressTracker.model.CaseStatus;
import com.example.DailyMoodStressTracker.model.Department;
import com.example.DailyMoodStressTracker.model.StudentCase;
import com.example.DailyMoodStressTracker.model.User;
import com.example.DailyMoodStressTracker.repository.UserRepository;
import com.example.DailyMoodStressTracker.service.CaseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hod")
@RequiredArgsConstructor
public class ApiHodController {

    private final CaseService caseService;
    private final UserRepository userRepository;

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(Authentication authentication) {
        User hod = getUser(authentication);
        Department dept = hod.getDepartment();

        List<StudentCase> activeCases = caseService.getCasesForDepartment(dept);
        List<StudentCase> allCases = caseService.getAllCasesForDepartment(dept);
        List<User> teachers = caseService.getTeachersInDepartment(dept);

        long flaggedCount = activeCases.stream().filter(c -> c.getStatus() == CaseStatus.FLAGGED).count();
        long assignedCount = activeCases.stream().filter(c -> c.getStatus() == CaseStatus.ASSIGNED).count();
        long inProgressCount = activeCases.stream().filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS).count();
        long resolvedCount = allCases.stream().filter(c -> c.getStatus() == CaseStatus.RESOLVED).count();

        Map<String, Object> response = new HashMap<>();
        response.put("hod", UserDto.fromEntity(hod));
        response.put("department", dept);
        response.put("activeCases", activeCases);
        response.put("allCases", allCases);
        response.put("teachers", teachers.stream().map(UserDto::fromEntity).collect(Collectors.toList()));
        response.put("flaggedCount", flaggedCount);
        response.put("assignedCount", assignedCount);
        response.put("inProgressCount", inProgressCount);
        response.put("resolvedCount", resolvedCount);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/assign/{caseId}")
    public ResponseEntity<?> assignTeacher(
            @PathVariable Long caseId,
            @RequestBody AssignTeacherRequest request,
            Authentication authentication) {

        User hod = getUser(authentication);
        caseService.assignTeacher(caseId, request.getTeacherId(), hod);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Student case assigned to teacher successfully!"
        ));
    }

    private User getUser(Authentication authentication) {
        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
