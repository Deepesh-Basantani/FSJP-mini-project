package com.example.foodrescue.service;

import com.example.foodrescue.dto.PickupResponse;
import com.example.foodrescue.dto.ReservationRequest;
import com.example.foodrescue.dto.ReservationResponse;
import com.example.foodrescue.entity.*;
import com.example.foodrescue.exception.BadRequestException;
import com.example.foodrescue.exception.ForbiddenException;
import com.example.foodrescue.exception.ResourceNotFoundException;
import com.example.foodrescue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final FoodDonationRepository donationRepository;
    private final UserRepository userRepository;
    private final PickupRecordRepository pickupRecordRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public ReservationService(ReservationRepository reservationRepository,
                              FoodDonationRepository donationRepository,
                              UserRepository userRepository,
                              PickupRecordRepository pickupRecordRepository,
                              NotificationService notificationService,
                              AuditService auditService) {
        this.reservationRepository = reservationRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.pickupRecordRepository = pickupRecordRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public ReservationResponse requestQuantity(Long donationId, ReservationRequest req, Long ngoId) {
        User ngo = userRepository.findById(ngoId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (ngo.getRole() != Role.NGO) {
            throw new ForbiddenException("Only registered NGOs can request food donations");
        }

        if (ngo.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new ForbiddenException("Only verified NGOs can request surplus food. Your verification is currently " + ngo.getVerificationStatus());
        }

        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found with id: " + donationId));

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new BadRequestException("This donation is no longer available (Status: " + donation.getStatus() + ")");
        }

        if (donation.getPickupDeadline().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This donation has expired and cannot accept new reservations");
        }

        if (req.getQuantityRequested().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Requested quantity must be positive");
        }

        if (req.getQuantityRequested().compareTo(donation.getQuantityAvailable()) > 0) {
            throw new BadRequestException("Requested quantity (" + req.getQuantityRequested() + " " + donation.getUnit() +
                    ") exceeds available quantity (" + donation.getQuantityAvailable() + " " + donation.getUnit() + ")");
        }

        if (reservationRepository.existsByDonationIdAndNgoIdAndStatus(donationId, ngoId, ReservationStatus.PENDING)) {
            throw new BadRequestException("You already have an active pending request for this donation");
        }

        Reservation reservation = new Reservation();
        reservation.setDonation(donation);
        reservation.setNgo(ngo);
        reservation.setQuantityRequested(req.getQuantityRequested());
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setRequestedAt(LocalDateTime.now());
        reservation.setNotes(req.getNotes());

        Reservation saved = reservationRepository.save(reservation);
        auditService.recordStatusChange("RESERVATION", saved.getId(), null, "PENDING", ngo, "Requested quantity: " + req.getQuantityRequested());

        // Notify Provider
        notificationService.createNotification(
                donation.getProvider(),
                "New food reservation request from " + ngo.getName() + " for " + req.getQuantityRequested() + " " + donation.getUnit() + " of '" + donation.getTitle() + "'",
                "REQUEST",
                saved.getId()
        );

        return ReservationResponse.fromEntity(saved);
    }

    @Transactional
    public ReservationResponse approveReservation(Long reservationId, Long providerId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        FoodDonation donation = donationRepository.findByIdForUpdate(reservation.getDonation().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (!donation.getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("Only the listing provider can approve reservation requests");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be approved. Current status: " + reservation.getStatus());
        }

        if (donation.getPickupDeadline().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Cannot approve request: donation collection deadline has passed");
        }

        if (reservation.getQuantityRequested().compareTo(donation.getQuantityAvailable()) > 0) {
            throw new BadRequestException("Cannot approve: requested quantity (" + reservation.getQuantityRequested() +
                    ") exceeds currently available quantity (" + donation.getQuantityAvailable() + ")");
        }

        // Deduct atomically inside lock
        donation.setQuantityAvailable(donation.getQuantityAvailable().subtract(reservation.getQuantityRequested()));
        if (donation.getQuantityAvailable().compareTo(BigDecimal.ZERO) == 0) {
            donation.setStatus(DonationStatus.RESERVED);
        }
        donationRepository.save(donation);

        reservation.setStatus(ReservationStatus.APPROVED);
        reservation.setDecisionAt(LocalDateTime.now());
        Reservation saved = reservationRepository.save(reservation);

        // Create pickup record
        PickupRecord pickup = new PickupRecord();
        pickup.setReservation(saved);
        pickup.setPickupStatus(PickupStatus.ASSIGNED);
        pickup.setHandoverConfirmedByProvider(false);
        pickup.setHandoverConfirmedByReceiver(false);
        pickupRecordRepository.save(pickup);

        auditService.recordStatusChange("RESERVATION", saved.getId(), "PENDING", "APPROVED", donation.getProvider(), "Reservation approved and quantity reserved");
        auditService.recordStatusChange("DONATION", donation.getId(), "AVAILABLE", donation.getStatus().name(), donation.getProvider(), "Quantity deducted: " + reservation.getQuantityRequested());

        // Notify NGO
        notificationService.createNotification(
                reservation.getNgo(),
                "Your reservation request for '" + donation.getTitle() + "' (" + reservation.getQuantityRequested() + " " + donation.getUnit() + ") has been approved!",
                "APPROVAL",
                saved.getId()
        );

        ReservationResponse response = ReservationResponse.fromEntity(saved);
        response.setPickup(PickupResponse.fromEntity(pickup));
        return response;
    }

    @Transactional
    public ReservationResponse rejectReservation(Long reservationId, Long providerId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        if (!reservation.getDonation().getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("Only the listing provider can reject reservation requests");
        }

        if (reservation.getStatus() != ReservationStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be rejected");
        }

        reservation.setStatus(ReservationStatus.REJECTED);
        reservation.setDecisionAt(LocalDateTime.now());
        Reservation saved = reservationRepository.save(reservation);

        auditService.recordStatusChange("RESERVATION", saved.getId(), "PENDING", "REJECTED", reservation.getDonation().getProvider(), "Reservation rejected");

        // Notify NGO
        notificationService.createNotification(
                reservation.getNgo(),
                "Your reservation request for '" + reservation.getDonation().getTitle() + "' was declined by the provider.",
                "REJECTION",
                saved.getId()
        );

        return ReservationResponse.fromEntity(saved);
    }

    @Transactional
    public ReservationResponse cancelReservation(Long reservationId, Long userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + reservationId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isNgo = reservation.getNgo().getId().equals(userId);
        boolean isAdmin = user.getRole() == Role.ADMINISTRATOR;

        if (!isNgo && !isAdmin) {
            throw new ForbiddenException("Only the requesting NGO or an administrator can cancel this reservation");
        }

        if (reservation.getStatus() == ReservationStatus.COMPLETED) {
            throw new BadRequestException("Completed reservations cannot be cancelled");
        }

        ReservationStatus oldStatus = reservation.getStatus();

        // If previously approved, restore quantity
        if (oldStatus == ReservationStatus.APPROVED) {
            FoodDonation donation = donationRepository.findByIdForUpdate(reservation.getDonation().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));
            donation.setQuantityAvailable(donation.getQuantityAvailable().add(reservation.getQuantityRequested()));
            if (donation.getStatus() == DonationStatus.RESERVED && donation.getQuantityAvailable().compareTo(BigDecimal.ZERO) > 0) {
                donation.setStatus(DonationStatus.AVAILABLE);
            }
            donationRepository.save(donation);

            pickupRecordRepository.findByReservationId(reservation.getId()).ifPresent(pickup -> {
                pickup.setPickupStatus(PickupStatus.CANCELLED);
                pickupRecordRepository.save(pickup);
            });
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        Reservation saved = reservationRepository.save(reservation);

        auditService.recordStatusChange("RESERVATION", saved.getId(), oldStatus.name(), "CANCELLED", user, "Reservation cancelled");

        // Notify provider
        notificationService.createNotification(
                reservation.getDonation().getProvider(),
                "Reservation request for '" + reservation.getDonation().getTitle() + "' was cancelled by " + reservation.getNgo().getName(),
                "CANCELLATION",
                saved.getId()
        );

        return ReservationResponse.fromEntity(saved);
    }

    public List<ReservationResponse> getDonationReservations(Long donationId, Long providerId) {
        FoodDonation donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new ResourceNotFoundException("Donation not found"));

        if (!donation.getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("Only the provider can view incoming requests for this listing");
        }

        return reservationRepository.findByDonationIdOrderByRequestedAtDesc(donationId)
                .stream()
                .map(res -> {
                    ReservationResponse resp = ReservationResponse.fromEntity(res);
                    pickupRecordRepository.findByReservationId(res.getId())
                            .ifPresent(p -> resp.setPickup(PickupResponse.fromEntity(p)));
                    return resp;
                })
                .collect(Collectors.toList());
    }

    public List<ReservationResponse> getMyReservations(Long userId, Role role) {
        List<Reservation> list;
        if (role == Role.NGO) {
            list = reservationRepository.findByNgoIdOrderByRequestedAtDesc(userId);
        } else if (role == Role.FOOD_PROVIDER) {
            list = reservationRepository.findByProviderId(userId);
        } else {
            list = reservationRepository.findAll();
        }

        return list.stream()
                .map(res -> {
                    ReservationResponse resp = ReservationResponse.fromEntity(res);
                    pickupRecordRepository.findByReservationId(res.getId())
                            .ifPresent(p -> resp.setPickup(PickupResponse.fromEntity(p)));
                    return resp;
                })
                .collect(Collectors.toList());
    }
}
