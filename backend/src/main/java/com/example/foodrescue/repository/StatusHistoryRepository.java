package com.example.foodrescue.repository;

import com.example.foodrescue.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    List<StatusHistory> findByEntityTypeAndEntityIdOrderByChangedAtDesc(String entityType, Long entityId);
    List<StatusHistory> findAllByOrderByChangedAtDesc();
}
