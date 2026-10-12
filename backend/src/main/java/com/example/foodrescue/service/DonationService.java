package com.example.foodrescue.service;

import com.example.foodrescue.dto.CreateDonationRequest;
import com.example.foodrescue.dto.DonationResponse;
import com.example.foodrescue.entity.*;
import com.example.foodrescue.exception.BadRequestException;
import com.example.foodrescue.exception.ForbiddenException;
import com.example.foodrescue.exception.ResourceNotFoundException;
import com.example.foodrescue.repository.FoodDonationRepository;
import com.example.foodrescue.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DonationService {

    private final FoodDonationRepository donationRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    public DonationService(FoodDonationRepository donationRepository,
                           UserRepository userRepository,
                           AuditService auditService) {
        this.donationRepository = donationRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    @Transactional
    public DonationResponse createDonation(CreateDonationRequest req, Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found"));

        if (provider.getRole() != Role.FOOD_PROVIDER) {
            throw new ForbiddenException("Only registered Food Providers can create donation listings");
        }

        if (req.getPickupDeadline().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Pickup deadline must be in the future");
        }

        FoodDonation donation = new FoodDonation();
        donation.setProvider(provider);
        donation.setTitle(req.getTitle());
        donation.setDescription(req.getDescription());
        donation.setCategory(req.getCategory());
        donation.setQuantityTotal(req.getQuantityTotal());
        donation.setQuantityAvailable(req.getQuantityTotal());
        donation.setUnit(req.getUnit());
        donation.setPreparedAt(req.getPreparedAt());
        donation.setPickupDeadline(req.getPickupDeadline());
        donation.setAddress(req.getAddress());
        donation.setLatitude(req.getLatitude());
        donation.setLongitude(req.getLongitude());
        donation.setPackagingNotes(req.getPackagingNotes());
        donation.setStorageInstructions(req.getStorageInstructions());
        donation.setImageUrl(req.getImageUrl());
        donation.setStatus(DonationStatus.AVAILABLE);
        donation.setCreatedAt(LocalDateTime.now());

        FoodDonation saved = donationRepository.save(donation);
        auditService.recordStatusChange("DONATION", saved.getId(), null, "AVAILABLE", provider, "Listing created");

        return DonationResponse.fromEntity(saved);
    }

    @Transactional
    public DonationResponse editDonation(Long id, CreateDonationRequest req, Long providerId) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation listing not found with id: " + id));

        if (!donation.getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You can only edit your own donation listings");
        }

        if (donation.getStatus() != DonationStatus.AVAILABLE) {
            throw new BadRequestException("Only listings in AVAILABLE status can be edited");
        }

        if (req.getPickupDeadline().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Pickup deadline must be in the future");
        }

        donation.setTitle(req.getTitle());
        donation.setDescription(req.getDescription());
        donation.setCategory(req.getCategory());
        donation.setQuantityTotal(req.getQuantityTotal());
        donation.setQuantityAvailable(req.getQuantityTotal());
        donation.setUnit(req.getUnit());
        donation.setPreparedAt(req.getPreparedAt());
        donation.setPickupDeadline(req.getPickupDeadline());
        donation.setAddress(req.getAddress());
        donation.setLatitude(req.getLatitude());
        donation.setLongitude(req.getLongitude());
        donation.setPackagingNotes(req.getPackagingNotes());
        donation.setStorageInstructions(req.getStorageInstructions());
        if (req.getImageUrl() != null && !req.getImageUrl().isBlank()) {
            donation.setImageUrl(req.getImageUrl());
        }

        FoodDonation updated = donationRepository.save(donation);
        auditService.recordStatusChange("DONATION", updated.getId(), "AVAILABLE", "AVAILABLE_UPDATED", donation.getProvider(), "Listing details updated");

        return DonationResponse.fromEntity(updated);
    }

    @Transactional
    public DonationResponse withdrawDonation(Long id, Long providerId) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation listing not found with id: " + id));

        if (!donation.getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You can only withdraw your own donation listings");
        }

        if (donation.getStatus() == DonationStatus.COMPLETED || donation.getStatus() == DonationStatus.COLLECTED) {
            throw new BadRequestException("Cannot withdraw a donation that has already been collected or completed");
        }

        DonationStatus oldStatus = donation.getStatus();
        donation.setStatus(DonationStatus.WITHDRAWN);
        FoodDonation saved = donationRepository.save(donation);

        auditService.recordStatusChange("DONATION", saved.getId(), oldStatus.name(), "WITHDRAWN", donation.getProvider(), "Donation withdrawn by provider");

        return DonationResponse.fromEntity(saved);
    }

    public DonationResponse getDonation(Long id) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation listing not found with id: " + id));
        return DonationResponse.fromEntity(donation);
    }

    public Page<DonationResponse> listDonations(String category,
                                                Double minQuantity,
                                                String keyword,
                                                int page,
                                                int size,
                                                String sortBy,
                                                String sortDir) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDir != null ? sortDir : "DESC"),
                (sortBy != null && !sortBy.isBlank()) ? sortBy : "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<FoodDonation> donations = donationRepository.searchDonations(
                DonationStatus.AVAILABLE,
                category,
                minQuantity,
                keyword,
                true,
                LocalDateTime.now(),
                pageable
        );

        return donations.map(DonationResponse::fromEntity);
    }

    public List<DonationResponse> listProviderDonations(Long providerId) {
        return donationRepository.findByProviderIdOrderByCreatedAtDesc(providerId)
                .stream()
                .map(DonationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public String uploadImage(Long id, MultipartFile file, Long providerId) {
        FoodDonation donation = donationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Donation listing not found with id: " + id));

        if (!donation.getProvider().getId().equals(providerId)) {
            throw new ForbiddenException("You can only upload images for your own donation listings");
        }

        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || (!contentType.startsWith("image/jpeg") && !contentType.startsWith("image/png") && !contentType.startsWith("image/webp"))) {
            throw new BadRequestException("Invalid file type. Only JPEG, PNG, and WebP images are allowed.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("Image file size exceeds maximum 5MB limit.");
        }

        try {
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String ext = contentType.contains("png") ? ".png" : (contentType.contains("webp") ? ".webp" : ".jpg");
            String filename = "donation-" + id + "-" + UUID.randomUUID() + ext;
            Path targetPath = Paths.get(uploadDir, filename);
            Files.copy(file.getInputStream(), targetPath);

            String imageUrl = "/uploads/" + filename;
            donation.setImageUrl(imageUrl);
            donationRepository.save(donation);

            return imageUrl;
        } catch (IOException e) {
            throw new BadRequestException("Failed to store image: " + e.getMessage());
        }
    }
}
