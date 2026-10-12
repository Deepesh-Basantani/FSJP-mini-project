package com.example.foodrescue.service;

import com.example.foodrescue.dto.ReportRequest;
import com.example.foodrescue.entity.Report;
import com.example.foodrescue.entity.User;
import com.example.foodrescue.exception.ResourceNotFoundException;
import com.example.foodrescue.repository.ReportRepository;
import com.example.foodrescue.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ReportService(ReportRepository reportRepository, UserRepository userRepository, AuditService auditService) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public Report createReport(ReportRequest req, Long reporterId) {
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found"));

        Report report = new Report(reporter, req.getTargetType(), req.getTargetId(), req.getReason());
        Report saved = reportRepository.save(report);

        auditService.recordStatusChange("REPORT", saved.getId(), null, "SUBMITTED", reporter, "Report filed for " + req.getTargetType() + " #" + req.getTargetId());
        return saved;
    }
}
