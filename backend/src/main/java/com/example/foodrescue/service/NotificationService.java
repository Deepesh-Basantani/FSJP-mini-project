package com.example.foodrescue.service;

import com.example.foodrescue.entity.Notification;
import com.example.foodrescue.entity.User;
import com.example.foodrescue.exception.ResourceNotFoundException;
import com.example.foodrescue.notification.NotificationEventPublisher;
import com.example.foodrescue.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationEventPublisher eventPublisher;

    public NotificationService(NotificationRepository notificationRepository, NotificationEventPublisher eventPublisher) {
        this.notificationRepository = notificationRepository;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public Notification createNotification(User user, String message, String type, Long entityId) {
        Notification notification = new Notification(user, message, type);
        Notification saved = notificationRepository.save(notification);

        // Forward event asynchronously to companion Node.js notification service
        eventPublisher.forwardEventToCompanion(user.getId(), type, message, entityId);

        return saved;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));
        if (notification.getUser().getId().equals(userId)) {
            notification.setIsRead(true);
            notificationRepository.save(notification);
        }
    }
}
