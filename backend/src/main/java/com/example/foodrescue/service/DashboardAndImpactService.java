package com.example.foodrescue.service;

import com.example.foodrescue.dto.DashboardSummaryResponse;
import com.example.foodrescue.dto.ImpactSummaryResponse;
import com.example.foodrescue.entity.*;
import com.example.foodrescue.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DashboardAndImpactService {

    private final FoodDonationRepository donationRepository;
    private final ReservationRepository reservationRepository;
    private final PickupRecordRepository pickupRecordRepository;
    private final UserRepository userRepository;
    private final ReportRepository reportRepository;

    public DashboardAndImpactService(FoodDonationRepository donationRepository,
                                     ReservationRepository reservationRepository,
                                     PickupRecordRepository pickupRecordRepository,
                                     UserRepository userRepository,
                                     ReportRepository reportRepository) {
        this.donationRepository = donationRepository;
        this.reservationRepository = reservationRepository;
        this.pickupRecordRepository = pickupRecordRepository;
        this.userRepository = userRepository;
        this.reportRepository = reportRepository;
    }

    public DashboardSummaryResponse getDashboardSummary(Long userId, Role role) {
        DashboardSummaryResponse res = new DashboardSummaryResponse();

        res.setTotalActiveListings(donationRepository.countByStatus(DonationStatus.AVAILABLE));
        res.setCompletedDonations(donationRepository.countByStatus(DonationStatus.COMPLETED));
        res.setTotalUsers(userRepository.count());
        res.setPendingVerifications(userRepository.findByVerificationStatus(VerificationStatus.PENDING).size());
        res.setOpenReports(reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING).size());

        if (role == Role.FOOD_PROVIDER) {
            List<FoodDonation> myDonations = donationRepository.findByProviderIdOrderByCreatedAtDesc(userId);
            res.setMyActiveListings(myDonations.stream().filter(d -> d.getStatus() == DonationStatus.AVAILABLE).count());
            List<Reservation> myRequests = reservationRepository.findByProviderId(userId);
            res.setPendingRequests(myRequests.stream().filter(r -> r.getStatus() == ReservationStatus.PENDING).count());
            res.setApprovedRequests(myRequests.stream().filter(r -> r.getStatus() == ReservationStatus.APPROVED).count());
        } else if (role == Role.NGO) {
            List<Reservation> myRequests = reservationRepository.findByNgoIdOrderByRequestedAtDesc(userId);
            res.setPendingRequests(myRequests.stream().filter(r -> r.getStatus() == ReservationStatus.PENDING).count());
            res.setApprovedRequests(myRequests.stream().filter(r -> r.getStatus() == ReservationStatus.APPROVED).count());
        } else if (role == Role.VOLUNTEER) {
            List<PickupRecord> pickups = pickupRecordRepository.findByVolunteerIdOrderByPickupTimeDesc(userId);
            res.setActivePickups(pickups.stream().filter(p -> p.getPickupStatus() == PickupStatus.ASSIGNED || p.getPickupStatus() == PickupStatus.COLLECTED).count());
        }

        return res;
    }

    public ImpactSummaryResponse getImpactSummary() {
        ImpactSummaryResponse response = new ImpactSummaryResponse();

        List<Reservation> completedReservations = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.COMPLETED)
                .collect(Collectors.toList());

        long totalCompleted = completedReservations.size();
        response.setTotalCompletedDonations(totalCompleted);

        BigDecimal portions = BigDecimal.ZERO;
        BigDecimal kilograms = BigDecimal.ZERO;
        Map<String, BigDecimal> unitTotals = new HashMap<>();

        for (Reservation r : completedReservations) {
            String unit = r.getDonation().getUnit().toLowerCase();
            BigDecimal qty = r.getQuantityRequested();
            unitTotals.put(unit, unitTotals.getOrDefault(unit, BigDecimal.ZERO).add(qty));

            if (unit.contains("portion") || unit.contains("meal") || unit.contains("pack")) {
                portions = portions.add(qty);
            } else if (unit.contains("kg") || unit.contains("kilo")) {
                kilograms = kilograms.add(qty);
            }
        }

        response.setTotalPortionsRedistributed(portions);
        response.setTotalKgRedistributed(kilograms);
        response.setQuantityByUnit(unitTotals);

        // Approximate beneficiaries: 1 portion = 1 person, 1 kg ≈ 2.5 portions
        long estimatedBeneficiaries = portions.longValue() + (long)(kilograms.doubleValue() * 2.5);
        response.setTotalBeneficiariesEstimated(estimatedBeneficiaries);

        long totalReservations = reservationRepository.count();
        long cancelledCount = reservationRepository.countByStatus(ReservationStatus.CANCELLED);
        long rejectedCount = reservationRepository.countByStatus(ReservationStatus.REJECTED);
        long expiredDonations = donationRepository.countByStatus(DonationStatus.EXPIRED);
        long totalDonations = donationRepository.count();

        double fulfillment = totalReservations > 0 ? ((double) totalCompleted / totalReservations) * 100.0 : 100.0;
        double expiry = totalDonations > 0 ? ((double) expiredDonations / totalDonations) * 100.0 : 0.0;

        response.setFulfillmentRate(Math.round(fulfillment * 10.0) / 10.0);
        response.setExpiryRate(Math.round(expiry * 10.0) / 10.0);

        // Monthly trend grouping
        Map<String, List<Reservation>> byMonth = completedReservations.stream()
                .collect(Collectors.groupingBy(r -> r.getRequestedAt().format(DateTimeFormatter.ofPattern("MMM yyyy"))));

        List<ImpactSummaryResponse.MonthlyImpact> monthlyTrends = new ArrayList<>();
        if (byMonth.isEmpty()) {
            monthlyTrends.add(new ImpactSummaryResponse.MonthlyImpact("Current", totalCompleted, portions));
        } else {
            byMonth.forEach((month, list) -> {
                BigDecimal monthlyQty = list.stream().map(Reservation::getQuantityRequested).reduce(BigDecimal.ZERO, BigDecimal::add);
                monthlyTrends.add(new ImpactSummaryResponse.MonthlyImpact(month, list.size(), monthlyQty));
            });
        }
        response.setMonthlyTrend(monthlyTrends);

        return response;
    }
}
