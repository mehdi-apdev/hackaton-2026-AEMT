package com.helha.backend.controllers;

import com.helha.backend.application.dto.AuthRequestDto;
import com.helha.backend.application.services.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor // Génère le constructeur pour l'injection automatique
public class AuthController {

    private final AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED) // Renvoie 201 quand c'est fini
    public void register(@RequestBody AuthRequestDto dto) {
        // On délègue toute la logique (vérification doublon + hachage) au service
        authService.register(dto);
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public String login(@RequestBody AuthRequestDto dto) {
        // On délègue l'authentification et la génération du JWT au service
        return authService.login(dto);
    }
}