package com.example.foodrescue.controller;

import com.example.foodrescue.dto.ReservationRequest;
import com.example.foodrescue.dto.ReservationResponse;
import com.example.foodrescue.security.CustomUserDetails;
import com.example.foodrescue.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping("/api/donations/{id}/reservations")
    public ResponseEntity<List<ReservationResponse>> getDonationReservations(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ReservationResponse> response = reservationService.getDonationReservations(id, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/donations/{id}/reservations")
    public ResponseEntity<ReservationResponse> requestReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ReservationRequest request) {
        ReservationResponse response = reservationService.requestQuantity(id, request, userDetails.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/api/reservations/mine")
    public ResponseEntity<List<ReservationResponse>> getMyReservations(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ReservationResponse> response = reservationService.getMyReservations(userDetails.getId(), userDetails.getUser().getRole());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/reservations/{id}/approve")
    public ResponseEntity<ReservationResponse> approveReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReservationResponse response = reservationService.approveReservation(id, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/reservations/{id}/reject")
    public ResponseEntity<ReservationResponse> rejectReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReservationResponse response = reservationService.rejectReservation(id, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/api/reservations/{id}/cancel")
    public ResponseEntity<ReservationResponse> cancelReservation(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ReservationResponse response = reservationService.cancelReservation(id, userDetails.getId());
        return ResponseEntity.ok(response);
    }
}
