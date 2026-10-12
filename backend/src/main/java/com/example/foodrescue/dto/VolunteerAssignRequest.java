package com.example.foodrescue.dto;

import jakarta.validation.constraints.NotNull;

public class VolunteerAssignRequest {
    @NotNull(message = "Volunteer ID is required")
    private Long volunteerId;

    public VolunteerAssignRequest() {}

    public Long getVolunteerId() { return volunteerId; }
    public void setVolunteerId(Long volunteerId) { this.volunteerId = volunteerId; }
}
