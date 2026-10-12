package com.example.foodrescue.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReportRequest {

    @NotBlank(message = "Target type is required")
    private String targetType;

    @NotNull(message = "Target ID is required")
    private Long targetId;

    @NotBlank(message = "Reason is required")
    private String reason;

    public ReportRequest() {}

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public Long getTargetId() { return targetId; }
    public void setTargetId(Long targetId) { this.targetId = targetId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
