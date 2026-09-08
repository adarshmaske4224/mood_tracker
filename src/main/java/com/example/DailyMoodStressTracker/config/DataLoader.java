package com.example.DailyMoodStressTracker.config;

import com.example.DailyMoodStressTracker.model.*;
import com.example.DailyMoodStressTracker.repository.*;
import com.example.DailyMoodStressTracker.service.StressAnalyzerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final MoodEntryRepository moodEntryRepository;
    private final StudentCaseRepository studentCaseRepository;
    private final PasswordEncoder passwordEncoder;
    private final StressAnalyzerService stressAnalyzerService;

    @Override
    public void run(String... args) {
        if (departmentRepository.count() > 0) {
            log.info("Data already exists, skipping seed.");
            return;
        }

        log.info("Seeding initial data...");

        // Create Departments
        Department cse = departmentRepository.save(Department.builder().name("Computer Science & Engineering").code("CSE").build());
        Department mech = departmentRepository.save(Department.builder().name("Mechanical Engineering").code("MECH").build());
        Department electrical = departmentRepository.save(Department.builder().name("Electrical Engineering").code("ELECTRICAL").build());
        Department civil = departmentRepository.save(Department.builder().name("Civil Engineering").code("CIVIL").build());
        Department aids = departmentRepository.save(Department.builder().name("AI & Data Science").code("AIDS").build());

        String encodedPassword = passwordEncoder.encode("password");

        // Create Principal
        userRepository.save(User.builder()
                .username("principal")
                .password(encodedPassword)
                .fullName("Dr. Rajesh Kumar")
                .role(Role.PRINCIPAL)
                .build());

        // Create HODs
        userRepository.save(User.builder().username("hod_cse").password(encodedPassword).fullName("Dr. Priya Sharma").role(Role.HOD).department(cse).build());
        userRepository.save(User.builder().username("hod_mech").password(encodedPassword).fullName("Dr. Anil Verma").role(Role.HOD).department(mech).build());
        userRepository.save(User.builder().username("hod_electrical").password(encodedPassword).fullName("Dr. Sunita Reddy").role(Role.HOD).department(electrical).build());
        userRepository.save(User.builder().username("hod_civil").password(encodedPassword).fullName("Dr. Mohan Patel").role(Role.HOD).department(civil).build());
        userRepository.save(User.builder().username("hod_aids").password(encodedPassword).fullName("Dr. Kavita Nair").role(Role.HOD).department(aids).build());

        // Create Teachers (2 per department)
        userRepository.save(User.builder().username("teacher_cse1").password(encodedPassword).fullName("Prof. Amit Singh").role(Role.TEACHER).department(cse).build());
        userRepository.save(User.builder().username("teacher_cse2").password(encodedPassword).fullName("Prof. Neha Gupta").role(Role.TEACHER).department(cse).build());
        userRepository.save(User.builder().username("teacher_mech1").password(encodedPassword).fullName("Prof. Vikram Joshi").role(Role.TEACHER).department(mech).build());
        userRepository.save(User.builder().username("teacher_mech2").password(encodedPassword).fullName("Prof. Ritu Mehta").role(Role.TEACHER).department(mech).build());
        userRepository.save(User.builder().username("teacher_electrical1").password(encodedPassword).fullName("Prof. Suresh Iyer").role(Role.TEACHER).department(electrical).build());
        userRepository.save(User.builder().username("teacher_electrical2").password(encodedPassword).fullName("Prof. Deepa Rao").role(Role.TEACHER).department(electrical).build());
        userRepository.save(User.builder().username("teacher_civil1").password(encodedPassword).fullName("Prof. Ramesh Tiwari").role(Role.TEACHER).department(civil).build());
        userRepository.save(User.builder().username("teacher_civil2").password(encodedPassword).fullName("Prof. Anita Desai").role(Role.TEACHER).department(civil).build());
        userRepository.save(User.builder().username("teacher_aids1").password(encodedPassword).fullName("Prof. Karthik Menon").role(Role.TEACHER).department(aids).build());
        userRepository.save(User.builder().username("teacher_aids2").password(encodedPassword).fullName("Prof. Swati Pillai").role(Role.TEACHER).department(aids).build());

        // Create Sample Students
        User student1 = userRepository.save(User.builder().username("rahul_cse").password(encodedPassword).fullName("Rahul Mehra").rollNumber("CSE2024001").phoneNumber("+91 98765 43210").role(Role.STUDENT).department(cse).build());
        User student2 = userRepository.save(User.builder().username("priya_cse").password(encodedPassword).fullName("Priya Kapoor").rollNumber("CSE2024002").phoneNumber("+91 98123 45678").role(Role.STUDENT).department(cse).build());
        User student3 = userRepository.save(User.builder().username("amit_mech").password(encodedPassword).fullName("Amit Dubey").rollNumber("MECH2024001").phoneNumber("+91 97654 32109").role(Role.STUDENT).department(mech).build());
        User student4 = userRepository.save(User.builder().username("sneha_aids").password(encodedPassword).fullName("Sneha Rajan").rollNumber("AIDS2024001").phoneNumber("+91 96543 21098").role(Role.STUDENT).department(aids).build());

        // Seed mood data for the past 7 days
        seedMoodData(student1, true);   // student1 will have high stress (triggers flagging)
        seedMoodData(student2, false);  // student2 has normal mood
        seedMoodData(student3, true);   // student3 will have high stress
        seedMoodData(student4, false);  // student4 has normal mood

        log.info("Data seeding complete!");
        log.info("=== Demo Login Credentials (password: 'password') ===");
        log.info("Principal: principal");
        log.info("HOD CSE: hod_cse | HOD MECH: hod_mech | HOD ELECTRICAL: hod_electrical | HOD CIVIL: hod_civil | HOD AIDS: hod_aids");
        log.info("Teacher: teacher_cse1, teacher_cse2, teacher_mech1, etc.");
        log.info("Students: rahul_cse, priya_cse, amit_mech, sneha_aids");
        log.info("Or register a new student at /register");
    }

    private void seedMoodData(User student, boolean highStress) {
        Random rand = new Random();
        String[] stressNotes = {
                "Feeling extremely overwhelmed with exams. Can't sleep properly, very anxious about results.",
                "So stressed about the project deadline. I feel exhausted and burned out. No motivation left.",
                "Having a terrible day. Everything feels hopeless, failing in studies. Very depressed.",
                "Anxious and worried about my future. Pressure from parents too. Can't cope anymore.",
                "Breakdown today. Crying all day, feel isolated and lonely. Nobody understands.",
                "Stressed about backlog exams. Insomnia getting worse. Feel like giving up.",
                "Overwhelmed with assignments. Very frustrated and exhausted. Terrible headache all day."
        };

        String[] normalNotes = {
                "Had a good day! Enjoyed the coding class and learned something new.",
                "Feeling okay today. Nothing special but no complaints either.",
                "Great day! Played sports with friends and feeling energetic and happy.",
                "A bit tired but overall feeling fine. Looking forward to the weekend.",
                "Productive day! Completed my assignment on time. Feeling motivated.",
                "Calm and relaxed today. Read a nice book in the library.",
                "Good day overall. Enjoyed the lab session, feeling confident about the project."
        };

        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            int mood;
            String notes;

            if (highStress) {
                mood = rand.nextInt(2) + 1; // 1-2 (Awful or Low)
                notes = stressNotes[6 - i];
            } else {
                mood = rand.nextInt(2) + 4; // 4-5 (Good or Great)
                notes = normalNotes[6 - i];
            }

            StressAnalyzerService.StressResult result = stressAnalyzerService.analyzeStress(notes, mood);

            MoodEntry entry = MoodEntry.builder()
                    .student(student)
                    .date(date)
                    .mood(mood)
                    .stressLevel(result.stressLevel())
                    .notes(notes)
                    .aiAnalysis(result.analysis())
                    .build();

            moodEntryRepository.save(entry);
        }

        // Create flagged case for high-stress students
        if (highStress) {
            StudentCase flaggedCase = StudentCase.builder()
                    .student(student)
                    .status(CaseStatus.FLAGGED)
                    .stressStreakDays(7)
                    .build();
            studentCaseRepository.save(flaggedCase);
        }
    }
}
