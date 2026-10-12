package com.example.foodrescue;

import com.example.foodrescue.dto.ReservationRequest;
import com.example.foodrescue.dto.ReservationResponse;
import com.example.foodrescue.entity.*;
import com.example.foodrescue.exception.BadRequestException;
import com.example.foodrescue.exception.ForbiddenException;
import com.example.foodrescue.repository.*;
import com.example.foodrescue.service.AuditService;
import com.example.foodrescue.service.NotificationService;
import com.example.foodrescue.service.ReservationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private FoodDonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PickupRecordRepository pickupRecordRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ReservationService reservationService;

    private User provider;
    private User verifiedNgo;
    private User unverifiedNgo;
    private FoodDonation donation;

    @BeforeEach
    void setUp() {
        provider = new User("Provider", "p@bistro.com", "hash", Role.FOOD_PROVIDER, "123", "Bistro");
        provider.setId(1L);
        provider.setVerificationStatus(VerificationStatus.VERIFIED);

        verifiedNgo = new User("Verified NGO", "ngo@hope.org", "hash", Role.NGO, "456", "Hope NGO");
        verifiedNgo.setId(2L);
        verifiedNgo.setVerificationStatus(VerificationStatus.VERIFIED);

        unverifiedNgo = new User("Unverified NGO", "new@ngo.org", "hash", Role.NGO, "789", "New NGO");
        unverifiedNgo.setId(3L);
        unverifiedNgo.setVerificationStatus(VerificationStatus.PENDING);

        donation = new FoodDonation();
        donation.setId(10L);
        donation.setProvider(provider);
        donation.setTitle("Surplus Rice");
        donation.setQuantityTotal(new BigDecimal("20"));
        donation.setQuantityAvailable(new BigDecimal("20"));
        donation.setUnit("portions");
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setPickupDeadline(LocalDateTime.now().plusHours(4));
    }

    @Test
    @DisplayName("Block unverified receiver from creating a reservation")
    void testUnverifiedNgoBlocked() {
        when(userRepository.findById(3L)).thenReturn(Optional.of(unverifiedNgo));

        ReservationRequest req = new ReservationRequest();
        req.setQuantityRequested(new BigDecimal("5"));

        assertThrows(ForbiddenException.class, () ->
                reservationService.requestQuantity(10L, req, 3L)
        );
    }

    @Test
    @DisplayName("Reject request exceeding available quantity")
    void testOverQuantityRejected() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(verifiedNgo));
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));

        ReservationRequest req = new ReservationRequest();
        req.setQuantityRequested(new BigDecimal("25")); // Available is only 20

        assertThrows(BadRequestException.class, () ->
                reservationService.requestQuantity(10L, req, 2L)
        );
    }

    @Test
    @DisplayName("Reject request for expired donation")
    void testExpiredDonationRejected() {
        donation.setPickupDeadline(LocalDateTime.now().minusMinutes(5));
        when(userRepository.findById(2L)).thenReturn(Optional.of(verifiedNgo));
        when(donationRepository.findById(10L)).thenReturn(Optional.of(donation));

        ReservationRequest req = new ReservationRequest();
        req.setQuantityRequested(new BigDecimal("5"));

        assertThrows(BadRequestException.class, () ->
                reservationService.requestQuantity(10L, req, 2L)
        );
    }

    @Test
    @DisplayName("Provider approves request: quantity is deducted and pickup record created")
    void testApproveReservation() {
        Reservation reservation = new Reservation();
        reservation.setId(100L);
        reservation.setDonation(donation);
        reservation.setNgo(verifiedNgo);
        reservation.setQuantityRequested(new BigDecimal("8"));
        reservation.setStatus(ReservationStatus.PENDING);

        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(donationRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(donation));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArgument(0));

        ReservationResponse response = reservationService.approveReservation(100L, 1L);

        assertEquals(ReservationStatus.APPROVED, response.getStatus());
        assertEquals(new BigDecimal("12"), donation.getQuantityAvailable()); // 20 - 8 = 12
        verify(pickupRecordRepository, times(1)).save(any(PickupRecord.class));
    }

    @Test
    @DisplayName("Prevent non-owner from approving reservation")
    void testNonOwnerCannotApprove() {
        Reservation reservation = new Reservation();
        reservation.setId(100L);
        reservation.setDonation(donation);
        reservation.setQuantityRequested(new BigDecimal("5"));
        reservation.setStatus(ReservationStatus.PENDING);

        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(donationRepository.findByIdForUpdate(10L)).thenReturn(Optional.of(donation));

        // Attempt approve by user 999 instead of owner 1
        assertThrows(ForbiddenException.class, () ->
                reservationService.approveReservation(100L, 999L)
        );
    }
}
