package com.example.foodrescue.dto;

import com.example.foodrescue.entity.PickupStatus;

public class StatusUpdateRequest {
    private PickupStatus status;
    private String note;

    public StatusUpdateRequest() {}

    public PickupStatus getStatus() { return status; }
    public void setStatus(PickupStatus status) { this.status = status; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
