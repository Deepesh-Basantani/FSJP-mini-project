package com.example.foodrescue.dto;

import com.example.foodrescue.entity.Role;
import com.example.foodrescue.entity.User;
import com.example.foodrescue.entity.VerificationStatus;
import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private String organisationName;
    private VerificationStatus verificationStatus;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public UserResponse() {}

    public static UserResponse fromEntity(User user) {
        if (user == null) return null;
        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setRole(user.getRole());
        res.setPhone(user.getPhone());
        res.setOrganisationName(user.getOrganisationName());
        res.setVerificationStatus(user.getVerificationStatus());
        res.setIsActive(user.getIsActive());
        res.setCreatedAt(user.getCreatedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getOrganisationName() { return organisationName; }
    public void setOrganisationName(String organisationName) { this.organisationName = organisationName; }

    public VerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(VerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
