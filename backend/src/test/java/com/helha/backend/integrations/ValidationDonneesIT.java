package com.helha.backend.integrations;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;
import com.helha.backend.application.dto.NoteCreationDto;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Tests d'Intégration - Validation des Données")
public class ValidationDonneesIT extends AbstractSpookyIT {

    @Test
    @DisplayName("POST /api/notes - Doit échouer (400) si le titre est vide")
    void createNote_withEmptyTitle_shouldReturnBadRequest() throws Exception {
        Cookie auth = getAuthCookie("user_valid");
        NoteCreationDto noteInvalide = new NoteCreationDto();
        noteInvalide.setTitle(""); // Titre vide non autorisé par les @NotBlank

        mockMvc.perform(post("/api/notes")
                        .cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(noteInvalide)))
                .andExpect(status().isBadRequest());
    }
    @ParameterizedTest
    @ValueSource(strings = {"", " ", "    ", "\n", "\t"})
    @DisplayName("POST /api/notes - Échec de validation pour titres vides ou blancs")
    void testTitresInvalides(String titreInvalide) throws Exception {
        Cookie auth = getAuthCookie("user_validation");
        NoteCreationDto dto = new NoteCreationDto();
        dto.setTitle(titreInvalide);

        mockMvc.perform(post("/api/notes")
                        .cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest()); // Attends 400
    }
}