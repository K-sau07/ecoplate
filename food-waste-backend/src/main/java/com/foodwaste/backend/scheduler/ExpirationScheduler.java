package com.foodwaste.backend.scheduler;

import com.foodwaste.backend.model.FoodItem;
import com.foodwaste.backend.model.FoodItemStatus;
import com.foodwaste.backend.model.NotificationType;
import com.foodwaste.backend.repository.FoodItemRepository;
import com.foodwaste.backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@RequiredArgsConstructor
public class ExpirationScheduler {

    private final FoodItemRepository foodItemRepository;
    private final NotificationService notificationService;

    // Run every day at 8:00 AM
    // Cron format: second, minute, hour, day of month, month, day(s) of week
    @Scheduled(cron = "0 0 8 * * *")
    public void checkExpiringItems() {
        LocalDate today = LocalDate.now();
        LocalDate twoDaysFromNow = today.plusDays(2);

        List<FoodItem> expiringItems = foodItemRepository.findByStatusAndExpiryDateBetween(
                FoodItemStatus.AVAILABLE, today, twoDaysFromNow);

        for (FoodItem item : expiringItems) {
            String message = String.format(
                    "⚠️ Expiry Alert: '%s' expires on %s. Suggestion: Lower price to $%.2f to sell fast.",
                    item.getItemName(),
                    item.getExpiryDate().toString(),
                    item.getOriginalPrice().doubleValue() * 0.4 // Suggest 60% off
            );

            notificationService.createNotification(
                    item.getStore(), // The Store Manager
                    message,
                    NotificationType.WARNING,
                    item.getId());
        }

        System.out.println("Checked expiry dates. Found " + expiringItems.size() + " items.");
    }
}
