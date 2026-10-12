package com.example.foodrescue.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "pickup_records")
public class PickupRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "volunteer_id")
    private User volunteer;

    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;

    @Column(name = "delivery_time")
    private LocalDateTime deliveryTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "pickup_status", nullable = false)
    private PickupStatus pickupStatus = PickupStatus.ASSIGNED;

    @Column(name = "handover_confirmed_by_provider", nullable = false)
    private Boolean handoverConfirmedByProvider = false;

    @Column(name = "handover_confirmed_by_receiver", nullable = false)
    private Boolean handoverConfirmedByReceiver = false;

    public PickupRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }

    public User getVolunteer() { return volunteer; }
    public void setVolunteer(User volunteer) { this.volunteer = volunteer; }

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
