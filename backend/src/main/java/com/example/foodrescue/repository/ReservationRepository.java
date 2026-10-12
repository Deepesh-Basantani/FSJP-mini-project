package com.example.foodrescue.repository;

import com.example.foodrescue.entity.Reservation;
import com.example.foodrescue.entity.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByDonationIdOrderByRequestedAtDesc(Long donationId);

    List<Reservation> findByNgoIdOrderByRequestedAtDesc(Long ngoId);

    @Query("SELECT r FROM Reservation r WHERE r.donation.provider.id = :providerId ORDER BY r.requestedAt DESC")
    List<Reservation> findByProviderId(@Param("providerId") Long providerId);

    boolean existsByDonationIdAndNgoIdAndStatus(Long donationId, Long ngoId, ReservationStatus status);

    long countByStatus(ReservationStatus status);
}
