package com.example.foodrescue.service;

import com.example.foodrescue.dto.UserResponse;
import com.example.foodrescue.dto.VerificationActionRequest;
import com.example.foodrescue.entity.*;
import com.example.foodrescue.exception.ResourceNotFoundException;
import com.example.foodrescue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final FoodDonationRepository donationRepository;
    private final ReportRepository reportRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public AdminService(UserRepository userRepository,
                        FoodDonationRepository donationRepository,
                        ReportRepository reportRepository,
                        NotificationService notificationService,
                        AuditService auditService) {
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
        this.reportRepository = reportRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    public List<UserResponse> getPendingVerifications() {
        return userRepository.findByVerificationStatus(VerificationStatus.PENDING)
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateVerification(Long userId, VerificationActionRequest req, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        User admin = userRepository.findById(adminId).orElseThrow();

        VerificationStatus oldStatus = user.getVerificationStatus();
        VerificationStatus newStatus = req.isApproved() ? VerificationStatus.VERIFIED : VerificationStatus.REJECTED;
        user.setVerificationStatus(newStatus);
        User saved = userRepository.save(user);

        String note = (req.isApproved() ? "Verification approved: " : "Verification rejected: ") + (req.getReason() != null ? req.getReason() : "");
        auditService.recordStatusChange("USER_VERIFICATION", user.getId(), oldStatus.name(), newStatus.name(), admin, note);

        notificationService.createNotification(
                user,
                req.isApproved() ? "Congratulations! Your organisation verification was approved." : "Your organisation verification was declined. Reason: " + req.getReason(),
                "VERIFICATION",
                user.getId()
        );

        return UserResponse.fromEntity(saved);
    }

    public List<UserResponse> listUsers(String search) {
        List<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.searchUsers(search);
        } else {
            users = userRepository.findAll();
        }
        return users.stream().map(UserResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, boolean isActive, Long adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        User admin = userRepository.findById(adminId).orElseThrow();

        user.setIsActive(isActive);
        User saved = userRepository.save(user);

        auditService.recordStatusChange("USER", user.getId(), isActive ? "SUSPENDED" : "ACTIVE", isActive ? "ACTIVE" : "SUSPENDED", admin, "Admin changed account active status");

        return UserResponse.fromEntity(saved);
    }

    @Transactional
    public void moderateDonation(Long donationId, Long adminId) {
        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + donationId));

        User admin = userRepository.findById(adminId).orElseThrow();

        DonationStatus oldStatus = donation.getStatus();
        donation.setStatus(DonationStatus.WITHDRAWN);
        donationRepository.save(donation);

        auditService.recordStatusChange("DONATION", donation.getId(), oldStatus.name(), "REMOVED_BY_ADMIN", admin, "Moderated and withdrawn by administrator");

        notificationService.createNotification(
                donation.getProvider(),
                "Your donation listing '" + donation.getTitle() + "' has been removed by platform moderation.",
                "MODERATION",
                donation.getId()
        );
    }

    public List<Report> listReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public Report resolveReport(Long reportId, boolean resolve, Long adminId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        User admin = userRepository.findById(adminId).orElseThrow();

        report.setStatus(resolve ? ReportStatus.RESOLVED : ReportStatus.DISMISSED);
        report.setResolvedBy(admin);
        report.setResolvedAt(LocalDateTime.now());

        Report saved = reportRepository.save(report);
        auditService.recordStatusChange("REPORT", saved.getId(), "PENDING", saved.getStatus().name(), admin, "Report resolved");

        return saved;
    }
}
