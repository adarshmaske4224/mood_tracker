package com.example.DailyMoodStressTracker.repository;

import com.example.DailyMoodStressTracker.model.CaseStatus;
import com.example.DailyMoodStressTracker.model.Department;
import com.example.DailyMoodStressTracker.model.StudentCase;
import com.example.DailyMoodStressTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentCaseRepository extends JpaRepository<StudentCase, Long> {

    @Query("SELECT sc FROM StudentCase sc WHERE sc.student.department = :dept AND sc.status IN :statuses")
    List<StudentCase> findByStudentDepartmentAndStatusIn(
            @Param("dept") Department dept,
            @Param("statuses") List<CaseStatus> statuses);

    List<StudentCase> findByAssignedTeacherAndStatusIn(User teacher, List<CaseStatus> statuses);

    List<StudentCase> findByStudent(User student);

    Optional<StudentCase> findByStudentAndStatusIn(User student, List<CaseStatus> statuses);

    List<StudentCase> findAllByStatusIn(List<CaseStatus> statuses);

    @Query("SELECT sc FROM StudentCase sc WHERE sc.student.department = :dept")
    List<StudentCase> findAllByStudentDepartment(@Param("dept") Department dept);

    boolean existsByStudentAndStatusIn(User student, List<CaseStatus> statuses);
}
