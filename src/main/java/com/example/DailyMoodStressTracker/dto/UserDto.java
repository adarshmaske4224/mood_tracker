package com.example.DailyMoodStressTracker.dto;

import com.example.DailyMoodStressTracker.model.Department;
import com.example.DailyMoodStressTracker.model.Role;
import com.example.DailyMoodStressTracker.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Long id;
    private String username;
    private String fullName;
    private String rollNumber;
    private String phoneNumber;
    private Role role;
    private Department department;

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .rollNumber(user.getRollNumber())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .department(user.getDepartment())
                .build();
    }
}
