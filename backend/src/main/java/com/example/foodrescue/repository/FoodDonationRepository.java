package com.example.foodrescue.repository;

import com.example.foodrescue.entity.DonationStatus;
import com.example.foodrescue.entity.FoodDonation;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface FoodDonationRepository extends JpaRepository<FoodDonation, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM FoodDonation d WHERE d.id = :id")
    Optional<FoodDonation> findByIdForUpdate(@Param("id") Long id);

    List<FoodDonation> findByProviderIdOrderByCreatedAtDesc(Long providerId);

    @Query("SELECT d FROM FoodDonation d WHERE " +
           "(:status IS NULL OR d.status = :status) AND " +
           "(:category IS NULL OR :category = '' OR LOWER(d.category) = LOWER(:category)) AND " +
           "(:minQuantity IS NULL OR d.quantityAvailable >= :minQuantity) AND " +
           "(:keyword IS NULL OR :keyword = '' OR LOWER(d.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.address) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:onlyActive = false OR (d.status = 'AVAILABLE' AND d.pickupDeadline > :now AND d.quantityAvailable > 0))")
    Page<FoodDonation> searchDonations(
            @Param("status") DonationStatus status,
            @Param("category") String category,
            @Param("minQuantity") Double minQuantity,
            @Param("keyword") String keyword,
            @Param("onlyActive") boolean onlyActive,
            @Param("now") LocalDateTime now,
            Pageable pageable
    );

    List<FoodDonation> findByStatusAndPickupDeadlineBefore(DonationStatus status, LocalDateTime deadline);

    long countByStatus(DonationStatus status);
}
