package com.example.foodrescue.dto;

import com.example.foodrescue.entity.PickupRecord;
import com.example.foodrescue.entity.PickupStatus;
import java.time.LocalDateTime;

public class PickupResponse {
    private Long id;
    private Long reservationId;
    private Long donationId;
    private String donationTitle;
    private String donationAddress;
    private Long volunteerId;
    private String volunteerName;
    private String volunteerPhone;
    private LocalDateTime pickupTime;
    private LocalDateTime deliveryTime;
    private PickupStatus pickupStatus;
    private Boolean handoverConfirmedByProvider;
    private Boolean handoverConfirmedByReceiver;

    public PickupResponse() {}

    public static PickupResponse fromEntity(PickupRecord record) {
        if (record == null) return null;
        PickupResponse res = new PickupResponse();
        res.setId(record.getId());
        if (record.getReservation() != null) {
            res.setReservationId(record.getReservation().getId());
            if (record.getReservation().getDonation() != null) {
                res.setDonationId(record.getReservation().getDonation().getId());
                res.setDonationTitle(record.getReservation().getDonation().getTitle());
                res.setDonationAddress(record.getReservation().getDonation().getAddress());
            }
        }
        if (record.getVolunteer() != null) {
            res.setVolunteerId(record.getVolunteer().getId());
            res.setVolunteerName(record.getVolunteer().getName());
            res.setVolunteerPhone(record.getVolunteer().getPhone());
        }
        res.setPickupTime(record.getPickupTime());
        res.setDeliveryTime(record.getDeliveryTime());
        res.setPickupStatus(record.getPickupStatus());
        res.setHandoverConfirmedByProvider(record.getHandoverConfirmedByProvider());
        res.setHandoverConfirmedByReceiver(record.getHandoverConfirmedByReceiver());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }

    public Long getDonationId() { return donationId; }
    public void setDonationId(Long donationId) { this.donationId = donationId; }

    public String getDonationTitle() { return donationTitle; }
    public void setDonationTitle(String donationTitle) { this.donationTitle = donationTitle; }

    public String getDonationAddress() { return donationAddress; }
    public void setDonationAddress(String donationAddress) { this.donationAddress = donationAddress; }

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }

    public String getVolunteerName() { return volunteerName; }
    public void setVolunteerName(String volunteerName) { this.volunteerName = volunteerName; }

    public String getVolunteerPhone() { return volunteerPhone; }
    public void setVolunteerPhone(String volunteerPhone) { this.volunteerPhone = volunteerPhone; }

    public LocalDateTime getPickupTime() { return pickupTime; }
    public void setPickupTime(LocalDateTime pickupTime) { this.pickupTime = pickupTime; }

    public LocalDateTime getDeliveryTime() { return deliveryTime; }
    public void setDeliveryTime(LocalDateTime deliveryTime) { this.deliveryTime = deliveryTime; }

    public PickupStatus getPickupStatus() { return pickupStatus; }
    public void setPickupStatus(PickupStatus pickupStatus) { this.pickupStatus = pickupStatus; }

    public Boolean getHandoverConfirmedByProvider() { return handoverConfirmedByProvider; }
    public void setHandoverConfirmedByProvider(Boolean handoverConfirmedByProvider) { this.handoverConfirmedByProvider = handoverConfirmedByProvider; }

    public Boolean getHandoverConfirmedByReceiver() { return handoverConfirmedByReceiver; }
    public void setHandoverConfirmedByReceiver(Boolean handoverConfirmedByReceiver) { this.handoverConfirmedByReceiver = handoverConfirmedByReceiver; }
}
