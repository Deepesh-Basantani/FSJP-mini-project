package com.example.foodrescue.controller;

import com.example.foodrescue.dto.PickupResponse;
import com.example.foodrescue.dto.StatusUpdateRequest;
import com.example.foodrescue.dto.VolunteerAssignRequest;
import com.example.foodrescue.security.CustomUserDetails;
import com.example.foodrescue.service.PickupService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pickups")
public class PickupController {

    private final PickupService pickupService;

    public PickupController(PickupService pickupService) {
        this.pickupService = pickupService;
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PickupResponse> updateStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody StatusUpdateRequest request) {
        PickupResponse response = pickupService.updatePickupStatus(id, request.getStatus(), request.getNote(), userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<PickupResponse> assignVolunteer(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody VolunteerAssignRequest request) {
        PickupResponse response = pickupService.assignVolunteer(id, request.getVolunteerId(), userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/assigned")
    public ResponseEntity<List<PickupResponse>> getAssignedPickups(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<PickupResponse> response = pickupService.getAssignedPickups(userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/confirm")
    public ResponseEntity<PickupResponse> confirmHandover(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        PickupResponse response = pickupService.confirmHandover(id, userDetails.getId());
        return ResponseEntity.ok(response);
    }
}
