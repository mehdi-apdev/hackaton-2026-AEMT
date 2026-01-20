package com.helha.backend.controllers;

import com.helha.backend.application.dto.AuthRequestDto;
import com.helha.backend.application.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(@RequestBody AuthRequestDto dto) {
        authService.register(dto);
    }

    // Version avec Cookie HTTP-Only
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody AuthRequestDto dto, HttpServletResponse response) {
        // 1. On récupère le token généré par le service
        String token = authService.login(dto);

        // 2. On crée le cookie sécurisé
        ResponseCookie jwtCookie = ResponseCookie.from("token", token)
                .httpOnly(true)      // Interdit l'accès au JS (protection XSS)
                .secure(false)       // 'true' uniquement en HTTPS (production)
                .path("/")           // Disponible pour toutes les routes
                .maxAge(3600)        // Expire après 1 heure (3600 secondes)
                .sameSite("Lax")     // Protection contre les attaques CSRF
                .build();

        // 3. On ajoute le cookie à la réponse
        response.addHeader(HttpHeaders.SET_COOKIE, jwtCookie.toString());

        return ResponseEntity.ok("Connexion réussie !");
    }

    // Nouvelle méthode de Logout
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        // Pour déconnecter, on crée un cookie avec le même nom et un maxAge à 0
        ResponseCookie deleteCookie = ResponseCookie.from("token", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0) // Détruit le cookie immédiatement
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, deleteCookie.toString());

        return ResponseEntity.ok("Déconnexion réussie !");
    }
}