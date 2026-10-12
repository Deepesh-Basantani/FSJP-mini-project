package com.example.foodrescue.dto;

import com.example.foodrescue.entity.DonationStatus;
import com.example.foodrescue.entity.FoodDonation;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class DonationResponse {
    private Long id;
    private Long providerId;
    private String providerName;
    private String providerOrganisation;
    private String title;
    private String description;
    private String category;
    private BigDecimal quantityTotal;
    private BigDecimal quantityAvailable;
    private String unit;
    private LocalDateTime preparedAt;
    private LocalDateTime pickupDeadline;
    private String address;
    private Double latitude;
    private Double longitude;
    private String packagingNotes;
    private String storageInstructions;
    private String imageUrl;
    private DonationStatus status;
    private LocalDateTime createdAt;

    public DonationResponse() {}

    public static DonationResponse fromEntity(FoodDonation donation) {
        if (donation == null) return null;
        DonationResponse res = new DonationResponse();
        res.setId(donation.getId());
        if (donation.getProvider() != null) {
            res.setProviderId(donation.getProvider().getId());
            res.setProviderName(donation.getProvider().getName());
            res.setProviderOrganisation(donation.getProvider().getOrganisationName());
        }
        res.setTitle(donation.getTitle());
        res.setDescription(donation.getDescription());
        res.setCategory(donation.getCategory());
        res.setQuantityTotal(donation.getQuantityTotal());
        res.setQuantityAvailable(donation.getQuantityAvailable());
        res.setUnit(donation.getUnit());
        res.setPreparedAt(donation.getPreparedAt());
        res.setPickupDeadline(donation.getPickupDeadline());
        res.setAddress(donation.getAddress());
        res.setLatitude(donation.getLatitude());
        res.setLongitude(donation.getLongitude());
        res.setPackagingNotes(donation.getPackagingNotes());
        res.setStorageInstructions(donation.getStorageInstructions());
        res.setImageUrl(donation.getImageUrl());
        res.setStatus(donation.getStatus());
        res.setCreatedAt(donation.getCreatedAt());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getProviderOrganisation() { return providerOrganisation; }
    public void setProviderOrganisation(String providerOrganisation) { this.providerOrganisation = providerOrganisation; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getQuantityTotal() { return quantityTotal; }
    public void setQuantityTotal(BigDecimal quantityTotal) { this.quantityTotal = quantityTotal; }

    public BigDecimal getQuantityAvailable() { return quantityAvailable; }
    public void setQuantityAvailable(BigDecimal quantityAvailable) { this.quantityAvailable = quantityAvailable; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDateTime getPreparedAt() { return preparedAt; }
    public void setPreparedAt(LocalDateTime preparedAt) { this.preparedAt = preparedAt; }

    public LocalDateTime getPickupDeadline() { return pickupDeadline; }
    public void setPickupDeadline(LocalDateTime pickupDeadline) { this.pickupDeadline = pickupDeadline; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getPackagingNotes() { return packagingNotes; }
    public void setPackagingNotes(String packagingNotes) { this.packagingNotes = packagingNotes; }

    public String getStorageInstructions() { return storageInstructions; }
    public void setStorageInstructions(String storageInstructions) { this.storageInstructions = storageInstructions; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public DonationStatus getStatus() { return status; }
    public void setStatus(DonationStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
