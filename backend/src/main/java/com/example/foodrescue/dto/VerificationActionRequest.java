package com.example.foodrescue.dto;

public class VerificationActionRequest {
    private boolean approved;
    private String reason;

    public VerificationActionRequest() {}

    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
