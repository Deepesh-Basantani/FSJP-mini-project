package com.example.foodrescue.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class ImpactSummaryResponse {
    private long totalCompletedDonations;
    private BigDecimal totalPortionsRedistributed;
    private BigDecimal totalKgRedistributed;
    private Map<String, BigDecimal> quantityByUnit;
    private long totalBeneficiariesEstimated;
    private double fulfillmentRate;
    private double expiryRate;
    private List<MonthlyImpact> monthlyTrend;

    public static class MonthlyImpact {
        private String month;
        private long completedCount;
        private BigDecimal quantity;

        public MonthlyImpact() {}

        public MonthlyImpact(String month, long completedCount, BigDecimal quantity) {
            this.month = month;
            this.completedCount = completedCount;
            this.quantity = quantity;
        }

        public String getMonth() { return month; }
        public void setMonth(String month) { this.month = month; }

        public long getCompletedCount() { return completedCount; }
        public void setCompletedCount(long completedCount) { this.completedCount = completedCount; }

        public BigDecimal getQuantity() { return quantity; }
        public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }
    }

    public ImpactSummaryResponse() {}

    public long getTotalCompletedDonations() { return totalCompletedDonations; }
    public void setTotalCompletedDonations(long totalCompletedDonations) { this.totalCompletedDonations = totalCompletedDonations; }

    public BigDecimal getTotalPortionsRedistributed() { return totalPortionsRedistributed; }
    public void setTotalPortionsRedistributed(BigDecimal totalPortionsRedistributed) { this.totalPortionsRedistributed = totalPortionsRedistributed; }

    public BigDecimal getTotalKgRedistributed() { return totalKgRedistributed; }
    public void setTotalKgRedistributed(BigDecimal totalKgRedistributed) { this.totalKgRedistributed = totalKgRedistributed; }

    public Map<String, BigDecimal> getQuantityByUnit() { return quantityByUnit; }
    public void setQuantityByUnit(Map<String, BigDecimal> quantityByUnit) { this.quantityByUnit = quantityByUnit; }

    public long getTotalBeneficiariesEstimated() { return totalBeneficiariesEstimated; }
    public void setTotalBeneficiariesEstimated(long totalBeneficiariesEstimated) { this.totalBeneficiariesEstimated = totalBeneficiariesEstimated; }

    public double getFulfillmentRate() { return fulfillmentRate; }
    public void setFulfillmentRate(double fulfillmentRate) { this.fulfillmentRate = fulfillmentRate; }

    public double getExpiryRate() { return expiryRate; }
    public void setExpiryRate(double expiryRate) { this.expiryRate = expiryRate; }

    public List<MonthlyImpact> getMonthlyTrend() { return monthlyTrend; }
    public void setMonthlyTrend(List<MonthlyImpact> monthlyTrend) { this.monthlyTrend = monthlyTrend; }
}
