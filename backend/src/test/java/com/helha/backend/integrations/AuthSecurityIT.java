package com.helha.backend.integrations;

import com.helha.backend.application.dto.AuthRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Tests d'Intégration - Authentification et Sécurité (30 scénarios)")
public class AuthSecurityIT extends AbstractSpookyIT {

    @ParameterizedTest
    @ValueSource(strings = {"wizard1", "wizard2", "wizard3", "wizard4", "wizard5", "wizard6", "wizard7", "wizard8", "wizard9", "wizard10"})
    @DisplayName("POST /api/auth/register - Inscriptions multiples")
    void testInscriptions(String name) throws Exception {
        AuthRequestDto dto = new AuthRequestDto();
        dto.setUsername(name);
        dto.setPassword("password123");
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }



    @ParameterizedTest
    @ValueSource(strings = {"/api/notes", "/api/folders/tree", "/api/corbeille"})
    @DisplayName("Sécurité - Accès refusé sans token")
    void testSecurity(String url) throws Exception {
        mockMvc.perform(get(url))
                .andExpect(status().isForbidden()); // On attend 403 au lieu de 401
    }
}