package com.foodwaste.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FoodWasteBackendApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(FoodWasteBackendApplication.class, args);
    }
}