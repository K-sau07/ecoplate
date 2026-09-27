package com.foodwaste.backend.service;

import com.foodwaste.backend.dto.NotificationDTO;
import com.foodwaste.backend.exception.ResourceNotFoundException;
import com.foodwaste.backend.model.Notification;
import com.foodwaste.backend.model.NotificationType;
import com.foodwaste.backend.model.User;
import com.foodwaste.backend.repository.NotificationRepository;
import com.foodwaste.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // Internal method to be used by Scheduler and other Services
    @Transactional
    public void createNotification(User recipient, String message, NotificationType type, Long relatedEntityId) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .message(message)
                .type(type)
                .relatedEntityId(relatedEntityId)
                .isRead(false)
                .build();

        notificationRepository.save(notification);
    }

    // Get notifications for current user
    public List<NotificationDTO> getMyNotifications() {
        User currentUser = getCurrentUser();
        return notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Get unread count for badge
    public long getUnreadCount() {
        User currentUser = getCurrentUser();
        return notificationRepository.countByRecipientAndIsReadFalse(currentUser);
    }

    // Mark specific notification as read
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        User currentUser = getCurrentUser();
        if (!notification.getRecipient().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Unauthorized access to notification");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    // Mark all as read
    @Transactional
    public void markAllAsRead() {
        User currentUser = getCurrentUser();
        List<Notification> unread = notificationRepository
                .findByRecipientAndIsReadFalseOrderByCreatedAtDesc(currentUser);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private NotificationDTO mapToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .relatedEntityId(notification.getRelatedEntityId())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}