package com.example.foodrescue.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ReservationRequest {

    @NotNull(message = "Requested quantity is required")
    @DecimalMin(value = "0.01", message = "Requested quantity must be positive")
    private BigDecimal quantityRequested;

    private String notes;

    public ReservationRequest() {}

    public BigDecimal getQuantityRequested() { return quantityRequested; }
    public void setQuantityRequested(BigDecimal quantityRequested) { this.quantityRequested = quantityRequested; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
