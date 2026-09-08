package com.example.DailyMoodStressTracker.repository;

import com.example.DailyMoodStressTracker.model.Department;
import com.example.DailyMoodStressTracker.model.Role;
import com.example.DailyMoodStressTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByRollNumber(String rollNumber);
    List<User> findAllByRole(Role role);
    List<User> findAllByRoleAndDepartment(Role role, Department department);
    boolean existsByUsername(String username);
    boolean existsByRollNumber(String rollNumber);
}
