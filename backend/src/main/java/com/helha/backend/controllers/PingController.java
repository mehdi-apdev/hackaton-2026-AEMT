package com.helha.backend.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class PingController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        // Renvoie un JSON simple : {"message": "Pong ! Le backend répond."}
        return Map.of("message", "Pong ! Le backend répond.");
    }
}