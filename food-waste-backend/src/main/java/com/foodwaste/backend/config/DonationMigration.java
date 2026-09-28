package com.foodwaste.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;
import java.sql.Connection;
import org.springframework.stereotype.Component;

/**
 * Database migration component for adding donation features.
 * Adds isDonation column to food_items table and creates donation_claims table.
 */
@Component
public class DonationMigration implements CommandLineRunner {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;
    
    @Override
    public void run(String... args) {
        if (!isMySql()) {
            return;
        }
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

    /**
     * These statements are MySQL-specific patches for databases created before the
     * corresponding entity fields existed (MODIFY COLUMN, LONGTEXT, BIT, AUTO_INCREMENT
     * are all MySQL syntax). On any other database — Postgres in production — Hibernate's
     * ddl-auto=update creates the schema from the entities directly, so there is nothing
     * to patch and running this would fail on the first statement.
     */
    private boolean isMySql() {
        try (Connection c = dataSource.getConnection()) {
            String product = c.getMetaData().getDatabaseProductName();
            return product != null && product.toLowerCase().contains("mysql");
        } catch (Exception e) {
            return false;
        }
    }
}
