package com.example.foodrescue.service;

import com.example.foodrescue.dto.PickupResponse;
import com.example.foodrescue.entity.*;
import com.example.foodrescue.exception.BadRequestException;
import com.example.foodrescue.exception.ForbiddenException;
import com.example.foodrescue.exception.ResourceNotFoundException;
import com.example.foodrescue.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PickupService {

    private final PickupRecordRepository pickupRecordRepository;
    private final ReservationRepository reservationRepository;
    private final FoodDonationRepository donationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public PickupService(PickupRecordRepository pickupRecordRepository,
                         ReservationRepository reservationRepository,
                         FoodDonationRepository donationRepository,
                         UserRepository userRepository,
                         NotificationService notificationService,
                         AuditService auditService) {
        this.pickupRecordRepository = pickupRecordRepository;
        this.reservationRepository = reservationRepository;
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public PickupResponse assignVolunteer(Long pickupId, Long volunteerId, Long currentUserId) {
        PickupRecord pickup = pickupRecordRepository.findById(pickupId)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup record not found with id: " + pickupId));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isProvider = pickup.getReservation().getDonation().getProvider().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == Role.ADMINISTRATOR;

        if (!isProvider && !isAdmin) {
            throw new ForbiddenException("Only the provider or an administrator can assign a volunteer to this pickup");
        }

        User volunteer = userRepository.findById(volunteerId)
                .orElseThrow(() -> new ResourceNotFoundException("Volunteer not found with id: " + volunteerId));

        if (volunteer.getRole() != Role.VOLUNTEER) {
            throw new BadRequestException("Selected user is not registered as a volunteer");
        }

        pickup.setVolunteer(volunteer);
        PickupRecord saved = pickupRecordRepository.save(pickup);

        auditService.recordStatusChange("PICKUP", saved.getId(), pickup.getPickupStatus().name(), "VOLUNTEER_ASSIGNED", currentUser, "Assigned to volunteer: " + volunteer.getName());

        notificationService.createNotification(
                volunteer,
                "You have been assigned to pick up food donation: '" + pickup.getReservation().getDonation().getTitle() + "' at " + pickup.getReservation().getDonation().getAddress(),
                "PICKUP",
                saved.getId()
        );

        return PickupResponse.fromEntity(saved);
    }

    @Transactional
    public PickupResponse updatePickupStatus(Long pickupId, PickupStatus newStatus, String note, Long currentUserId) {
        PickupRecord pickup = pickupRecordRepository.findById(pickupId)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup record not found with id: " + pickupId));

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isAssignedVolunteer = pickup.getVolunteer() != null && pickup.getVolunteer().getId().equals(currentUserId);
        boolean isProvider = pickup.getReservation().getDonation().getProvider().getId().equals(currentUserId);
        boolean isNgo = pickup.getReservation().getNgo().getId().equals(currentUserId);
        boolean isAdmin = currentUser.getRole() == Role.ADMINISTRATOR;

        if (!isAssignedVolunteer && !isProvider && !isNgo && !isAdmin) {
            throw new ForbiddenException("Not authorized to update status for this pickup");
        }

        PickupStatus oldStatus = pickup.getPickupStatus();

        if (newStatus == PickupStatus.COLLECTED) {
            pickup.setPickupTime(LocalDateTime.now());
            pickup.setPickupStatus(PickupStatus.COLLECTED);
        } else if (newStatus == PickupStatus.DELIVERED) {
            pickup.setDeliveryTime(LocalDateTime.now());
            pickup.setPickupStatus(PickupStatus.DELIVERED);
        } else {
            pickup.setPickupStatus(newStatus);
        }

        PickupRecord saved = pickupRecordRepository.save(pickup);
        auditService.recordStatusChange("PICKUP", saved.getId(), oldStatus.name(), newStatus.name(), currentUser, note != null ? note : "Status updated to " + newStatus);

        return PickupResponse.fromEntity(saved);
    }

    @Transactional
    public PickupResponse confirmHandover(Long pickupId, Long currentUserId) {
        PickupRecord pickup = pickupRecordRepository.findById(pickupId)
                .orElseThrow(() -> new ResourceNotFoundException("Pickup record not found with id: " + pickupId));

        Reservation reservation = pickup.getReservation();
        FoodDonation donation = reservation.getDonation();

        boolean isProvider = donation.getProvider().getId().equals(currentUserId);
        boolean isReceiver = reservation.getNgo().getId().equals(currentUserId);

        if (!isProvider && !isReceiver) {
            throw new ForbiddenException("Only the provider or receiving NGO involved in this donation can confirm handover");
        }

        User user = userRepository.findById(currentUserId).orElseThrow();

        if (isProvider) {
            pickup.setHandoverConfirmedByProvider(true);
            auditService.recordStatusChange("PICKUP", pickup.getId(), pickup.getPickupStatus().name(), "PROVIDER_CONFIRMED", user, "Provider confirmed food handover");
        }
        if (isReceiver) {
            pickup.setHandoverConfirmedByReceiver(true);
            auditService.recordStatusChange("PICKUP", pickup.getId(), pickup.getPickupStatus().name(), "RECEIVER_CONFIRMED", user, "Receiver confirmed food receipt");
        }

        // Section 5.2 & 12: Complete reservation ONLY when BOTH confirmations are recorded!
        if (Boolean.TRUE.equals(pickup.getHandoverConfirmedByProvider()) &&
            Boolean.TRUE.equals(pickup.getHandoverConfirmedByReceiver())) {

            pickup.setPickupStatus(PickupStatus.DELIVERED);
            if (pickup.getDeliveryTime() == null) {
                pickup.setDeliveryTime(LocalDateTime.now());
            }

            reservation.setStatus(ReservationStatus.COMPLETED);
            reservationRepository.save(reservation);

            donation.setStatus(DonationStatus.COMPLETED);
            donationRepository.save(donation);

            auditService.recordStatusChange("RESERVATION", reservation.getId(), "APPROVED", "COMPLETED", user, "Mutual handover confirmed by both parties. Donation completed.");
            auditService.recordStatusChange("DONATION", donation.getId(), donation.getStatus().name(), "COMPLETED", user, "Donation handover fully completed.");

            notificationService.createNotification(donation.getProvider(), "Donation '" + donation.getTitle() + "' has been marked fully completed! Thank you for reducing food waste.", "PICKUP", pickup.getId());
            notificationService.createNotification(reservation.getNgo(), "Handover for '" + donation.getTitle() + "' completed successfully. Thank you!", "PICKUP", pickup.getId());
        }

        PickupRecord saved = pickupRecordRepository.save(pickup);
        return PickupResponse.fromEntity(saved);
    }

    public List<PickupResponse> getAssignedPickups(Long volunteerId) {
        return pickupRecordRepository.findByVolunteerIdOrderByPickupTimeDesc(volunteerId)
                .stream()
                .map(PickupResponse::fromEntity)
                .collect(Collectors.toList());
    }
}
