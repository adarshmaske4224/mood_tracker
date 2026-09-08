package com.example.DailyMoodStressTracker.repository;

import com.example.DailyMoodStressTracker.model.MoodEntry;
import com.example.DailyMoodStressTracker.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MoodEntryRepository extends JpaRepository<MoodEntry, Long> {
    List<MoodEntry> findByStudentAndDateBetweenOrderByDateAsc(User student, LocalDate start, LocalDate end);
    Optional<MoodEntry> findByStudentAndDate(User student, LocalDate date);
    List<MoodEntry> findByStudentOrderByDateDesc(User student);
    List<MoodEntry> findAllByDateBetween(LocalDate start, LocalDate end);
}
