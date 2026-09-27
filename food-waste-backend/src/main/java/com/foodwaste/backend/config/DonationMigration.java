package com.foodwaste.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Database migration component for adding donation features.
 * Adds isDonation column to food_items table and creates donation_claims table.
 */
@Component
public class DonationMigration implements CommandLineRunner {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Override
    public void run(String... args) {
        try {
            // Add isDonation column to food_items table if it doesn't exist
            String addColumnSql = 
                "ALTER TABLE food_items " +
                "ADD COLUMN IF NOT EXISTS is_donation BOOLEAN DEFAULT FALSE NOT NULL";
            jdbcTemplate.execute(addColumnSql);
            
            // Create donation_claims table if it doesn't exist
            String createTableSql = 
                "CREATE TABLE IF NOT EXISTS donation_claims (" +
                "id BIGINT PRIMARY KEY AUTO_INCREMENT, " +
                "food_item_id BIGINT NOT NULL, " +
                "ngo_id BIGINT NOT NULL, " +
                "quantity_claimed INT NOT NULL, " +
                "status VARCHAR(20) NOT NULL, " +
                "ngo_message TEXT, " +
                "store_response TEXT, " +
                "created_at DATETIME(6), " +
                "updated_at DATETIME(6), " +
                "FOREIGN KEY (food_item_id) REFERENCES food_items(id), " +
                "FOREIGN KEY (ngo_id) REFERENCES users(id)" +
                ")";
            jdbcTemplate.execute(createTableSql);
            
            System.out.println("✅ Donation migration completed successfully!");
            System.out.println("✅ Added isDonation column to food_items");
            System.out.println("✅ Created donation_claims table");
            
        } catch (Exception e) {
            System.err.println("❌ Donation migration failed: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
