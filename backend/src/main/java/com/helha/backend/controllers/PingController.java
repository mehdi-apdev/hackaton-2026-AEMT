package com.helha.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

/**
 * DEPRECATED
 * 
 * Simple controller to respond to ping requests, useful for health checks.
 */
@RestController
@RequestMapping("/api")
public class PingController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        // Returns a simple JSON: {"message": "Pong! The backend is responding."}
        return Map.of("message", "Pong ! Le backend répond.");
    }
}