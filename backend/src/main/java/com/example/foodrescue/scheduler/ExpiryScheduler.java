package com.example.foodrescue.scheduler;

import com.example.foodrescue.entity.DonationStatus;
import com.example.foodrescue.entity.FoodDonation;
import com.example.foodrescue.repository.FoodDonationRepository;
import com.example.foodrescue.service.AuditService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class ExpiryScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ExpiryScheduler.class);

    private final FoodDonationRepository donationRepository;
    private final AuditService auditService;

    public ExpiryScheduler(FoodDonationRepository donationRepository, AuditService auditService) {
        this.donationRepository = donationRepository;
        this.auditService = auditService;
    }

    @Scheduled(fixedRate = 60000) // Run every 60 seconds
    @Transactional
    public void closeExpiredListings() {
        LocalDateTime now = LocalDateTime.now();
        List<FoodDonation> expiredDonations = donationRepository.findByStatusAndPickupDeadlineBefore(DonationStatus.AVAILABLE, now);

        for (FoodDonation donation : expiredDonations) {
            donation.setStatus(DonationStatus.EXPIRED);
            donationRepository.save(donation);
            auditService.recordStatusChange("DONATION", donation.getId(), "AVAILABLE", "EXPIRED", donation.getProvider(), "Automatically closed past collection deadline by ExpiryScheduler");
            logger.info("Automatically marked donation listing #{} as EXPIRED past deadline {}", donation.getId(), donation.getPickupDeadline());
        }
    }
}
