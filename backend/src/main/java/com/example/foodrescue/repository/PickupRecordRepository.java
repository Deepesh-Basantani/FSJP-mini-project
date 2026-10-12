package com.example.foodrescue.repository;

import com.example.foodrescue.entity.PickupRecord;
import com.example.foodrescue.entity.PickupStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PickupRecordRepository extends JpaRepository<PickupRecord, Long> {

    Optional<PickupRecord> findByReservationId(Long reservationId);

    List<PickupRecord> findByVolunteerIdOrderByPickupTimeDesc(Long volunteerId);

    List<PickupRecord> findByPickupStatus(PickupStatus status);
}
