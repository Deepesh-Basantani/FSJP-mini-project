package com.example.foodrescue.controller;

import com.example.foodrescue.dto.ReportRequest;
import com.example.foodrescue.entity.Report;
import com.example.foodrescue.security.CustomUserDetails;
import com.example.foodrescue.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping
    public ResponseEntity<Report> createReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReportRequest request) {
        Report report = reportService.createReport(request, userDetails.getId());
        return new ResponseEntity<>(report, HttpStatus.CREATED);
    }
}
