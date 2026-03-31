package com.helha.backend.integrations;

import com.helha.backend.application.dto.AuthRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Tests d'Intégration - Authentification")
public class AuthControllerIT extends AbstractSpookyIT {

    @ParameterizedTest
    @ValueSource(strings = {"user1", "sorcier_noir", "fantome123", "admin_spooky"})
    @DisplayName("POST /api/auth/register - Inscription de plusieurs pseudos")
    void register_PlusieursPseudos(String username) throws Exception {
        AuthRequestDto dto = new AuthRequestDto();
        dto.setUsername(username);
        dto.setPassword("pass12345");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /api/auth/login - Échec avec mauvais mot de passe (401)")
    void login_MauvaisPassword_Echec() throws Exception {
        getAuthCookie("testeur");
        AuthRequestDto dto = new AuthRequestDto();
        dto.setUsername("testeur");
        dto.setPassword("wrong_pass");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isUnauthorized());
    }
}