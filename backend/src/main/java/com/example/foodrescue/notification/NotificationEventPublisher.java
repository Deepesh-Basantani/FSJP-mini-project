package com.example.foodrescue.notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Component
public class NotificationEventPublisher {

    private static final Logger logger = LoggerFactory.getLogger(NotificationEventPublisher.class);

    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:5000/internal/notify}")
    private String notificationServiceUrl;

    @Value("${notification.service.secret:foodrescue_shared_secret_2026}")
    private String sharedSecret;

    public NotificationEventPublisher(RestTemplateBuilder builder) {
        this.restTemplate = builder
                .setConnectTimeout(Duration.ofMillis(1500))
                .setReadTimeout(Duration.ofMillis(1500))
                .build();
    }

    @Async
    public void forwardEventToCompanion(Long userId, String type, String message, Long entityId) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Internal-Secret", sharedSecret);

            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", userId);
            payload.put("type", type);
            payload.put("message", message);
            payload.put("entityId", entityId);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            restTemplate.postForEntity(notificationServiceUrl, entity, Void.class);
            logger.info("Successfully pushed notification to Node.js companion service for user {}", userId);
        } catch (Exception e) {
            // As documented in Section 6 & 13: if companion service is down, graceful degradation occurs
            logger.debug("Companion notification service unavailable: {}", e.getMessage());
        }
    }
}
