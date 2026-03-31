package com.helha.backend.integrations;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Tests d'Intégration - Système")
public class SystemControllerIT extends AbstractSpookyIT {

    @Test
    @DisplayName("GET /api/ping - Doit retourner le message pong")
    void ping_shouldReturnPong() throws Exception {
        mockMvc.perform(get("/api/ping"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Pong ! Le backend répond."));
    }
}