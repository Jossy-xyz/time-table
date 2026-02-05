package com.example.springproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;


@SpringBootApplication
public class SpringprojectApplication {

    public static void main(String[] args) {
        try {
            SpringApplication.run(SpringprojectApplication.class, args);
            System.out.println("\n" + "=".repeat(60));
            System.out.println("🚀 INSTITUTIONAL REGISTRY CORE - ONLINE");
            System.out.println("🔗 ENGINE ACCESS: http://localhost:8080");
            System.out.println("=".repeat(60) + "\n");
        } catch (Exception e) {
            String message = e.getMessage();
            if (message != null && (message.contains("Connection refused") || message.contains("Communications link failure"))) {
                System.err.println("\n" + "!".repeat(60));
                System.err.println("🔴 CRITICAL: DATABASE CONNECTION REFUSED");
                System.err.println("   The application cannot reach MySQL on port 3306.");
                System.err.println("   Please ensure MySQL Service is RUNNING and 'examtt2' DB exists.");
                System.err.println("!".repeat(60) + "\n");
            }
            throw e;
        }
    }
}


