package com.example.foodrescue.controller;

import com.example.foodrescue.dto.CreateDonationRequest;
import com.example.foodrescue.dto.DonationResponse;
import com.example.foodrescue.security.CustomUserDetails;
import com.example.foodrescue.service.DonationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationService donationService;

    public DonationController(DonationService donationService) {
        this.donationService = donationService;
    }

    @GetMapping
    public ResponseEntity<Page<DonationResponse>> listDonations(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minQuantity,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        Page<DonationResponse> result = donationService.listDonations(category, minQuantity, keyword, page, size, sortBy, sortDir);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonationResponse> getDonation(@PathVariable Long id) {
        DonationResponse response = donationService.getDonation(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<DonationResponse> createDonation(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateDonationRequest request) {
        DonationResponse response = donationService.createDonation(request, userDetails.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/mine")
    public ResponseEntity<List<DonationResponse>> getMyDonations(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<DonationResponse> response = donationService.listProviderDonations(userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DonationResponse> editDonation(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateDonationRequest request) {
        DonationResponse response = donationService.editDonation(id, request, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/withdraw")
    public ResponseEntity<DonationResponse> withdrawDonation(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        DonationResponse response = donationService.withdrawDonation(id, userDetails.getId());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<Map<String, String>> uploadDonationImage(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") MultipartFile file) {
        String imageUrl = donationService.uploadImage(id, file, userDetails.getId());
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }
}
