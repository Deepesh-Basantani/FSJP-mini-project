package com.example.foodrescue.dto;

import com.example.foodrescue.entity.Reservation;
import com.example.foodrescue.entity.ReservationStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReservationResponse {
    private Long id;
    private Long donationId;
    private String donationTitle;
    private String donationAddress;
    private LocalDateTime pickupDeadline;
    private String donationUnit;
    private Long providerId;
    private String providerName;
    private String providerOrganisation;
    private Long ngoId;
    private String ngoName;
    private String ngoOrganisation;
    private BigDecimal quantityRequested;
    private ReservationStatus status;
    private LocalDateTime requestedAt;
    private LocalDateTime decisionAt;
    private String notes;
    private PickupResponse pickup;

    public ReservationResponse() {}

    public static ReservationResponse fromEntity(Reservation reservation) {
        if (reservation == null) return null;
        ReservationResponse res = new ReservationResponse();
        res.setId(reservation.getId());
        if (reservation.getDonation() != null) {
            res.setDonationId(reservation.getDonation().getId());
            res.setDonationTitle(reservation.getDonation().getTitle());
            res.setDonationAddress(reservation.getDonation().getAddress());
            res.setPickupDeadline(reservation.getDonation().getPickupDeadline());
            res.setDonationUnit(reservation.getDonation().getUnit());
            if (reservation.getDonation().getProvider() != null) {
                res.setProviderId(reservation.getDonation().getProvider().getId());
                res.setProviderName(reservation.getDonation().getProvider().getName());
                res.setProviderOrganisation(reservation.getDonation().getProvider().getOrganisationName());
            }
        }
        if (reservation.getNgo() != null) {
            res.setNgoId(reservation.getNgo().getId());
            res.setNgoName(reservation.getNgo().getName());
            res.setNgoOrganisation(reservation.getNgo().getOrganisationName());
        }
        res.setQuantityRequested(reservation.getQuantityRequested());
        res.setStatus(reservation.getStatus());
        res.setRequestedAt(reservation.getRequestedAt());
        res.setDecisionAt(reservation.getDecisionAt());
        res.setNotes(reservation.getNotes());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDonationId() { return donationId; }
    public void setDonationId(Long donationId) { this.donationId = donationId; }

    public String getDonationTitle() { return donationTitle; }
    public void setDonationTitle(String donationTitle) { this.donationTitle = donationTitle; }

    public String getDonationAddress() { return donationAddress; }
    public void setDonationAddress(String donationAddress) { this.donationAddress = donationAddress; }

    public LocalDateTime getPickupDeadline() { return pickupDeadline; }
    public void setPickupDeadline(LocalDateTime pickupDeadline) { this.pickupDeadline = pickupDeadline; }

    public String getDonationUnit() { return donationUnit; }
    public void setDonationUnit(String donationUnit) { this.donationUnit = donationUnit; }

    public Long getProviderId() { return providerId; }
    public void setProviderId(Long providerId) { this.providerId = providerId; }

    public String getProviderName() { return providerName; }
    public void setProviderName(String providerName) { this.providerName = providerName; }

    public String getProviderOrganisation() { return providerOrganisation; }
    public void setProviderOrganisation(String providerOrganisation) { this.providerOrganisation = providerOrganisation; }

    public Long getNgoId() { return ngoId; }
    public void setNgoId(Long ngoId) { this.ngoId = ngoId; }

    public String getNgoName() { return ngoName; }
    public void setNgoName(String ngoName) { this.ngoName = ngoName; }

    public String getNgoOrganisation() { return ngoOrganisation; }
    public void setNgoOrganisation(String ngoOrganisation) { this.ngoOrganisation = ngoOrganisation; }

    public BigDecimal getQuantityRequested() { return quantityRequested; }
    public void setQuantityRequested(BigDecimal quantityRequested) { this.quantityRequested = quantityRequested; }

    public ReservationStatus getStatus() { return status; }
    public void setStatus(ReservationStatus status) { this.status = status; }

    public LocalDateTime getRequestedAt() { return requestedAt; }
    public void setRequestedAt(LocalDateTime requestedAt) { this.requestedAt = requestedAt; }

    public LocalDateTime getDecisionAt() { return decisionAt; }
    public void setDecisionAt(LocalDateTime decisionAt) { this.decisionAt = decisionAt; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public PickupResponse getPickup() { return pickup; }
    public void setPickup(PickupResponse pickup) { this.pickup = pickup; }
}
