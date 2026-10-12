package com.example.foodrescue.controller;

import com.example.foodrescue.dto.DashboardSummaryResponse;
import com.example.foodrescue.dto.ImpactSummaryResponse;
import com.example.foodrescue.security.CustomUserDetails;
import com.example.foodrescue.service.DashboardAndImpactService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardAndImpactService dashboardService;

    public DashboardController(DashboardAndImpactService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/summary")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DashboardSummaryResponse response = dashboardService.getDashboardSummary(
                userDetails.getId(),
                userDetails.getUser().getRole()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/impact/summary")
    public ResponseEntity<ImpactSummaryResponse> getImpactSummary() {
        ImpactSummaryResponse response = dashboardService.getImpactSummary();
        return ResponseEntity.ok(response);
    }
}
