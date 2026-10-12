package com.example.foodrescue.service;

import com.example.foodrescue.entity.StatusHistory;
import com.example.foodrescue.entity.User;
import com.example.foodrescue.repository.StatusHistoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuditService {

    private final StatusHistoryRepository statusHistoryRepository;

    public AuditService(StatusHistoryRepository statusHistoryRepository) {
        this.statusHistoryRepository = statusHistoryRepository;
    }

    @Transactional
    public void recordStatusChange(String entityType, Long entityId, String oldStatus, String newStatus, User changedBy, String note) {
        StatusHistory history = new StatusHistory(entityType, entityId, oldStatus, newStatus, changedBy, note);
        statusHistoryRepository.save(history);
    }

    public List<StatusHistory> getEntityHistory(String entityType, Long entityId) {
        return statusHistoryRepository.findByEntityTypeAndEntityIdOrderByChangedAtDesc(entityType, entityId);
    }

    public List<StatusHistory> getAllAuditLogs() {
        return statusHistoryRepository.findAllByOrderByChangedAtDesc();
    }
}
