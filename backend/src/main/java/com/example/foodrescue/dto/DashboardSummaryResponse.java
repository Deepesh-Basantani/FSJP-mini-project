package com.example.foodrescue.dto;

import java.util.Map;

public class DashboardSummaryResponse {
    private long totalActiveListings;
    private long myActiveListings;
    private long pendingRequests;
    private long approvedRequests;
    private long activePickups;
    private long completedDonations;
    private long totalUsers;
    private long pendingVerifications;
    private long openReports;
    private Map<String, Object> additionalStats;

    public DashboardSummaryResponse() {}

    public long getTotalActiveListings() { return totalActiveListings; }
    public void setTotalActiveListings(long totalActiveListings) { this.totalActiveListings = totalActiveListings; }

    public long getMyActiveListings() { return myActiveListings; }
    public void setMyActiveListings(long myActiveListings) { this.myActiveListings = myActiveListings; }

    public long getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(long pendingRequests) { this.pendingRequests = pendingRequests; }

    public long getApprovedRequests() { return approvedRequests; }
    public void setApprovedRequests(long approvedRequests) { this.approvedRequests = approvedRequests; }

    public long getActivePickups() { return activePickups; }
    public void setActivePickups(long activePickups) { this.activePickups = activePickups; }

    public long getCompletedDonations() { return completedDonations; }
    public void setCompletedDonations(long completedDonations) { this.completedDonations = completedDonations; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getPendingVerifications() { return pendingVerifications; }
    public void setPendingVerifications(long pendingVerifications) { this.pendingVerifications = pendingVerifications; }

    public long getOpenReports() { return openReports; }
    public void setOpenReports(long openReports) { this.openReports = openReports; }

    public Map<String, Object> getAdditionalStats() { return additionalStats; }
    public void setAdditionalStats(Map<String, Object> additionalStats) { this.additionalStats = additionalStats; }
}
