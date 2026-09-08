package com.example.DailyMoodStressTracker.service;

import com.example.DailyMoodStressTracker.model.*;
import com.example.DailyMoodStressTracker.repository.MoodEntryRepository;
import com.example.DailyMoodStressTracker.repository.StudentCaseRepository;
import com.example.DailyMoodStressTracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final StudentCaseRepository caseRepository;
    private final UserRepository userRepository;
    private final MoodEntryRepository moodEntryRepository;

    /**
     * Get flagged/active cases for a department (HOD view).
     */
    public List<StudentCase> getCasesForDepartment(Department dept) {
        return caseRepository.findByStudentDepartmentAndStatusIn(
                dept,
                List.of(CaseStatus.FLAGGED, CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS)
        );
    }

    /**
     * Get all cases for a department including resolved (HOD history).
     */
    public List<StudentCase> getAllCasesForDepartment(Department dept) {
        return caseRepository.findAllByStudentDepartment(dept);
    }

    /**
     * HOD assigns a flagged student to a teacher.
     */
    @Transactional
    public StudentCase assignTeacher(Long caseId, Long teacherId, User hod) {
        StudentCase studentCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (teacher.getRole() != Role.TEACHER) {
            throw new RuntimeException("User is not a teacher");
        }

        studentCase.setAssignedTeacher(teacher);
        studentCase.setAssignedBy(hod);
        studentCase.setStatus(CaseStatus.ASSIGNED);

        return caseRepository.save(studentCase);
    }

    /**
     * Get cases assigned to a teacher.
     */
    public List<StudentCase> getAssignedCases(User teacher) {
        return caseRepository.findByAssignedTeacherAndStatusIn(
                teacher,
                List.of(CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS)
        );
    }

    /**
     * Get all cases for a teacher including resolved ones.
     */
    public List<StudentCase> getAllTeacherCases(User teacher) {
        return caseRepository.findByAssignedTeacherAndStatusIn(
                teacher,
                List.of(CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS, CaseStatus.RESOLVED)
        );
    }

    /**
     * Teacher provides solution and starts 7-day tracking.
     */
    @Transactional
    public StudentCase provideSolution(Long caseId, String solution, User teacher) {
        StudentCase studentCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        if (!studentCase.getAssignedTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You are not assigned to this case");
        }

        studentCase.setTeacherSolution(solution);
        if (studentCase.getStatus() != CaseStatus.RESOLVED) {
            studentCase.setStatus(CaseStatus.IN_PROGRESS);
        }
        if (studentCase.getTrackingStartDate() == null) {
            studentCase.setTrackingStartDate(LocalDate.now());
            studentCase.setTrackingEndDate(LocalDate.now().plusDays(7));
        }

        return caseRepository.save(studentCase);
    }

    /**
     * Teacher resolves a case.
     */
    @Transactional
    public StudentCase resolveCase(Long caseId, User teacher) {
        StudentCase studentCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new RuntimeException("Case not found"));

        if (!studentCase.getAssignedTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("You are not assigned to this case");
        }

        studentCase.setStatus(CaseStatus.RESOLVED);

        return caseRepository.save(studentCase);
    }

    /**
     * Get active case for a student (if any).
     */
    public Optional<StudentCase> getActiveCase(User student) {
        return caseRepository.findByStudentAndStatusIn(
                student,
                List.of(CaseStatus.FLAGGED, CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS)
        );
    }

    /**
     * Get all cases (Principal view).
     */
    public List<StudentCase> getAllActiveCases() {
        return caseRepository.findAllByStatusIn(
                List.of(CaseStatus.FLAGGED, CaseStatus.ASSIGNED, CaseStatus.IN_PROGRESS)
        );
    }

    /**
     * Get all cases including resolved (Principal view).
     */
    public List<StudentCase> getAllCases() {
        return caseRepository.findAll();
    }

    /**
     * Get department-wise statistics for Principal dashboard.
     */
    public Map<String, Map<String, Long>> getDepartmentStats(List<Department> departments) {
        Map<String, Map<String, Long>> stats = new LinkedHashMap<>();

        for (Department dept : departments) {
            List<StudentCase> deptCases = caseRepository.findAllByStudentDepartment(dept);
            List<User> deptStudents = userRepository.findAllByRoleAndDepartment(Role.STUDENT, dept);

            Map<String, Long> deptStats = new LinkedHashMap<>();
            deptStats.put("totalStudents", (long) deptStudents.size());
            deptStats.put("flagged", deptCases.stream().filter(c -> c.getStatus() == CaseStatus.FLAGGED).count());
            deptStats.put("assigned", deptCases.stream().filter(c -> c.getStatus() == CaseStatus.ASSIGNED).count());
            deptStats.put("inProgress", deptCases.stream().filter(c -> c.getStatus() == CaseStatus.IN_PROGRESS).count());
            deptStats.put("resolved", deptCases.stream().filter(c -> c.getStatus() == CaseStatus.RESOLVED).count());
            deptStats.put("activeCases", deptStats.get("flagged") + deptStats.get("assigned") + deptStats.get("inProgress"));

            stats.put(dept.getName(), deptStats);
        }

        return stats;
    }

    /**
     * Get teachers in a department.
     */
    public List<User> getTeachersInDepartment(Department dept) {
        return userRepository.findAllByRoleAndDepartment(Role.TEACHER, dept);
    }
}
