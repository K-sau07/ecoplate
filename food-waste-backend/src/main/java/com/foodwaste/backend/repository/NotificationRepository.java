package com.foodwaste.backend.repository;

import com.foodwaste.backend.model.Notification;
import com.foodwaste.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications for a user, newest first
    List<Notification> findByRecipientOrderByCreatedAtDesc(User recipient);

    // Get only unread notifications
    List<Notification> findByRecipientAndIsReadFalseOrderByCreatedAtDesc(User recipient);

    // Count unread notifications (for the red badge number)
    long countByRecipientAndIsReadFalse(User recipient);
}