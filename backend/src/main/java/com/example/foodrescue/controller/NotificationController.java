package com.example.foodrescue.controller;

import com.example.foodrescue.entity.Notification;
import com.example.foodrescue.security.CustomUserDetails;
import com.example.foodrescue.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> listNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<Notification> list = notificationService.getUserNotifications(userDetails.getId());
        return ResponseEntity.ok(list);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, String>> markRead(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAsRead(id, userDetails.getId());
        return ResponseEntity.ok(Map.of("message", "Marked notification as read"));
    }
}
