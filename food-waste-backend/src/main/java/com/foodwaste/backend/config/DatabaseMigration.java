package com.foodwaste.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import javax.sql.DataSource;
import java.sql.Connection;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigration implements CommandLineRunner {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;
    
    @Override
    public void run(String... args) throws Exception {
        try {
            // Alter image_url column to LONGTEXT to support large base64 images
            jdbcTemplate.execute("ALTER TABLE food_items MODIFY COLUMN image_url LONGTEXT");
            System.out.println("✅ Successfully updated image_url column to LONGTEXT");
        } catch (Exception e) {
            // Column might already be LONGTEXT, ignore error
            System.out.println("⚠️  Column migration skipped (might already be applied): " + e.getMessage());
        }
        
        try {
            // Alter orders.status column to support new PAID status
            jdbcTemplate.execute("ALTER TABLE orders MODIFY COLUMN status VARCHAR(20)");
            System.out.println("✅ Successfully updated orders.status column to VARCHAR(20)");
        } catch (Exception e) {
            System.out.println("⚠️  Orders status migration skipped: " + e.getMessage());
        }
        
        try {
            // Add deleted column to food_items for soft delete
            jdbcTemplate.execute("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS deleted BIT NOT NULL DEFAULT 0");
            System.out.println("✅ Successfully added deleted column to food_items");
        } catch (Exception e) {
            System.out.println("⚠️  Deleted column migration skipped: " + e.getMessage());
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
