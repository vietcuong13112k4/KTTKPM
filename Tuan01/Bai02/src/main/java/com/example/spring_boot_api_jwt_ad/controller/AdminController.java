package com.example.spring_boot_api_jwt_ad.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @GetMapping("/test")
    public ResponseEntity<?> adminTest() {
        return ResponseEntity.ok("Admin access granted! You have ROLE_ADMIN permission.");
    }

    @GetMapping("/users")
    public ResponseEntity<?> getUsers() {
        return ResponseEntity.ok("Admin endpoint: Get all users");
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok("Admin endpoint: Dashboard");
    }
}

