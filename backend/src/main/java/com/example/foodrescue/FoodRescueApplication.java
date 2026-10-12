package com.example.foodrescue;

import com.example.foodrescue.entity.*;
import com.example.foodrescue.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class FoodRescueApplication {

    public static void main(String[] args) {
        SpringApplication.run(FoodRescueApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository,
                                          FoodDonationRepository donationRepository,
                                          ReservationRepository reservationRepository,
                                          PickupRecordRepository pickupRecordRepository,
                                          StatusHistoryRepository statusHistoryRepository,
                                          PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() > 0) return;

            // 1. Seed Accounts
            User admin = new User("System Administrator", "admin@foodrescue.org", passwordEncoder.encode("password123"), Role.ADMINISTRATOR, "+91 98765 00001", "Food Rescue Central");
            admin.setVerificationStatus(VerificationStatus.VERIFIED);
            userRepository.save(admin);

            User provider = new User("Green Bistro Restaurant", "provider@greenbistro.com", passwordEncoder.encode("password123"), Role.FOOD_PROVIDER, "+91 98765 00002", "Green Bistro Ltd");
            provider.setVerificationStatus(VerificationStatus.VERIFIED);
            userRepository.save(provider);

            User baker = new User("Sunrise Bakery", "baker@sunrise.com", passwordEncoder.encode("password123"), Role.FOOD_PROVIDER, "+91 98765 00003", "Sunrise Bakehouse");
            baker.setVerificationStatus(VerificationStatus.VERIFIED);
            userRepository.save(baker);

            User ngo = new User("Hope Community Kitchen", "ngo@hopekitchen.org", passwordEncoder.encode("password123"), Role.NGO, "+91 98765 00004", "Hope Foundation NGO");
            ngo.setVerificationStatus(VerificationStatus.VERIFIED);
            userRepository.save(ngo);

            User pendingNgo = new User("Shelter Care Collective", "newngo@sheltercare.org", passwordEncoder.encode("password123"), Role.NGO, "+91 98765 00005", "Shelter Care");
            pendingNgo.setVerificationStatus(VerificationStatus.PENDING);
            userRepository.save(pendingNgo);

            User volunteer = new User("Alex Kumar", "volunteer@foodrescue.org", passwordEncoder.encode("password123"), Role.VOLUNTEER, "+91 98765 00006", "Independent Volunteer");
            volunteer.setVerificationStatus(VerificationStatus.VERIFIED);
            userRepository.save(volunteer);

            // 2. Seed Donations
            FoodDonation d1 = new FoodDonation();
            d1.setProvider(provider);
            d1.setTitle("Fresh Cooked Vegetable Biryani & Raita");
            d1.setDescription("Prepared for lunch banquet service. Kept warm in food-grade insulated containers. High quality, safe surplus.");
            d1.setCategory("Cooked Meals");
            d1.setQuantityTotal(new BigDecimal("35"));
            d1.setQuantityAvailable(new BigDecimal("35"));
            d1.setUnit("portions");
            d1.setPreparedAt(LocalDateTime.now().minusHours(2));
            d1.setPickupDeadline(LocalDateTime.now().plusHours(6));
            d1.setAddress("42 Commercial Street, Central District, Bengaluru");
            d1.setLatitude(12.9815);
            d1.setLongitude(77.6080);
            d1.setPackagingNotes("Packed in stainless food trays. Bring own containers or transport crates.");
            d1.setStorageInstructions("Consume or refrigerate within 4 hours.");
            d1.setStatus(DonationStatus.AVAILABLE);
            d1.setCreatedAt(LocalDateTime.now().minusHours(2));
            donationRepository.save(d1);

            FoodDonation d2 = new FoodDonation();
            d2.setProvider(baker);
            d2.setTitle("Artisan Wholewheat Loaves & Brioche");
            d2.setDescription("Freshly baked daily surplus. Cleanly wrapped in paper bags.");
            d2.setCategory("Bakery");
            d2.setQuantityTotal(new BigDecimal("20"));
            d2.setQuantityAvailable(new BigDecimal("20"));
            d2.setUnit("packets");
            d2.setPreparedAt(LocalDateTime.now().minusHours(5));
            d2.setPickupDeadline(LocalDateTime.now().plusHours(12));
            d2.setAddress("18 MG Road, Bakery Lane, Bengaluru");
            d2.setLatitude(12.9734);
            d2.setLongitude(77.6110);
            d2.setPackagingNotes("Dry packaging intact, sealed.");
            d2.setStorageInstructions("Store in cool, dry location.");
            d2.setStatus(DonationStatus.AVAILABLE);
            d2.setCreatedAt(LocalDateTime.now().minusHours(5));
            donationRepository.save(d2);

            FoodDonation d3 = new FoodDonation();
            d3.setProvider(provider);
            d3.setTitle("Organic Mixed Greens & Root Vegetables");
            d3.setDescription("Unused seasonal organic vegetables from event prep. Crisp, washed and boxed.");
            d3.setCategory("Fresh Produce");
            d3.setQuantityTotal(new BigDecimal("15"));
            d3.setQuantityAvailable(new BigDecimal("15"));
            d3.setUnit("kg");
            d3.setPreparedAt(LocalDateTime.now().minusHours(3));
            d3.setPickupDeadline(LocalDateTime.now().plusHours(24));
            d3.setAddress("42 Commercial Street, Central District, Bengaluru");
            d3.setLatitude(12.9815);
            d3.setLongitude(77.6080);
            d3.setPackagingNotes("Ventilated crates.");
            d3.setStorageInstructions("Refrigerate at 4°C.");
            d3.setStatus(DonationStatus.AVAILABLE);
            d3.setCreatedAt(LocalDateTime.now().minusHours(3));
            donationRepository.save(d3);

            // 3. Seed historical completed donation for impact reporting
            FoodDonation dCompleted = new FoodDonation();
            dCompleted.setProvider(provider);
            dCompleted.setTitle("Assorted Sandwiches & Fruit Bowls");
            dCompleted.setDescription("Morning corporate seminar surplus. Fully redistributed.");
            dCompleted.setCategory("Cooked Meals");
            dCompleted.setQuantityTotal(new BigDecimal("50"));
            dCompleted.setQuantityAvailable(BigDecimal.ZERO);
            dCompleted.setUnit("portions");
            dCompleted.setPreparedAt(LocalDateTime.now().minusDays(2));
            dCompleted.setPickupDeadline(LocalDateTime.now().minusDays(1));
            dCompleted.setAddress("42 Commercial Street, Central District, Bengaluru");
            dCompleted.setLatitude(12.9815);
            dCompleted.setLongitude(77.6080);
            dCompleted.setStatus(DonationStatus.COMPLETED);
            dCompleted.setCreatedAt(LocalDateTime.now().minusDays(2));
            donationRepository.save(dCompleted);

            Reservation rCompleted = new Reservation();
            rCompleted.setDonation(dCompleted);
            rCompleted.setNgo(ngo);
            rCompleted.setQuantityRequested(new BigDecimal("50"));
            rCompleted.setStatus(ReservationStatus.COMPLETED);
            rCompleted.setRequestedAt(LocalDateTime.now().minusDays(2));
            rCompleted.setDecisionAt(LocalDateTime.now().minusDays(2).plusMinutes(20));
            rCompleted.setNotes("Redistributed to community shelter.");
            reservationRepository.save(rCompleted);

            PickupRecord pCompleted = new PickupRecord();
            pCompleted.setReservation(rCompleted);
            pCompleted.setVolunteer(volunteer);
            pCompleted.setPickupTime(LocalDateTime.now().minusDays(2).plusHours(2));
            pCompleted.setDeliveryTime(LocalDateTime.now().minusDays(2).plusHours(3));
            pCompleted.setPickupStatus(PickupStatus.DELIVERED);
            pCompleted.setHandoverConfirmedByProvider(true);
            pCompleted.setHandoverConfirmedByReceiver(true);
            pickupRecordRepository.save(pCompleted);

            StatusHistory sh = new StatusHistory("DONATION", dCompleted.getId(), "AVAILABLE", "COMPLETED", provider, "Seeded completed donation demo");
            statusHistoryRepository.save(sh);
        };
    }
}
