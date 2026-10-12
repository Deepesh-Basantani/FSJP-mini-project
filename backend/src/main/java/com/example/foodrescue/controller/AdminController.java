package com.example.foodrescue.controller;

import com.example.foodrescue.dto.UserResponse;
import com.example.foodrescue.dto.VerificationActionRequest;
import com.example.foodrescue.entity.Report;
import com.example.foodrescue.security.CustomUserDetails;
import com.example.foodrescue.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/verifications")
    public ResponseEntity<List<UserResponse>> getPendingVerifications() {
        List<UserResponse> list = adminService.getPendingVerifications();
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/verifications/{id}")
    public ResponseEntity<UserResponse> updateVerification(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody VerificationActionRequest request) {
        UserResponse response = adminService.updateVerification(id, request, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> listUsers(
            @RequestParam(required = false) String search) {
        List<UserResponse> list = adminService.listUsers(search);
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Boolean> payload) {
        boolean isActive = payload.getOrDefault("isActive", true);
        UserResponse response = adminService.updateUserStatus(id, isActive, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/donations/{id}/remove")
    public ResponseEntity<Map<String, String>> removeDonation(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        adminService.moderateDonation(id, userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "Donation listing withdrawn by admin"));
    }

    @GetMapping("/reports")
    public ResponseEntity<List<Report>> listReports() {
        List<Report> list = adminService.listReports();
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/reports/{id}")
    public ResponseEntity<Report> resolveReport(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody Map<String, Boolean> payload) {
        boolean resolve = payload.getOrDefault("resolve", true);
        Report result = adminService.resolveReport(id, resolve, userDetails.getId());
        return ResponseEntity.ok(result);
    }
}
