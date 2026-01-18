package com.helha.backend;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Collections;

import static java.util.Arrays.asList;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Bean
    public CorsFilter corsFilter() {
        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        final CorsConfiguration config = new CorsConfiguration();

        // Permet d'envoyer des cookies ou headers d'auth
        config.setAllowCredentials(true);

        // L'adresse de ton Frontend React (Vite)
        config.setAllowedOrigins(Collections.singletonList("http://localhost:5173"));

        // Les headers autorisés
        config.setAllowedHeaders(asList("Origin", "Content-Type", "Accept", "Authorization"));

        // Les verbes HTTP autorisés (GET, POST, etc.)
        config.setAllowedMethods(asList("GET", "POST", "PUT", "OPTIONS", "DELETE", "PATCH"));

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}