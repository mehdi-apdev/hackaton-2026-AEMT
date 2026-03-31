package com.helha.backend.integrations;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.application.dto.NoteCreationDto;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@DisplayName("Tests d'Intégration - Limites et Structure (6 scénarios)")
public class StructureLimitesIT extends AbstractSpookyIT {

    @Test
    @DisplayName("POST /api/notes - Création avec un contenu très large (UTF-8)")
    void createNote_VeryLargeContent() throws Exception {
        Cookie auth = getAuthCookie("user_limite");
        NoteCreationDto dto = new NoteCreationDto();
        dto.setTitle("Grosse Note");
        dto.setContent("A".repeat(10000)); // 10k caractères

        mockMvc.perform(post("/api/notes").cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.characterCount").value(10000))
                .andExpect(jsonPath("$.sizeInBytes").value(10000));
    }

    @Test
    @DisplayName("POST /api/folders - Création avec parent inexistant")
    void createFolder_InvalidParent_Returns404() throws Exception {
        Cookie auth = getAuthCookie("user_test");
        FolderCreationDto dto = new FolderCreationDto();
        dto.setName("Dossier Orphelin");
        dto.setParentId(9999L); // ID inexistant

        mockMvc.perform(post("/api/folders").cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /api/notes - Titre avec caractères spéciaux et Emojis")
    void createNote_SpecialCharacters() throws Exception {
        Cookie auth = getAuthCookie("user_emoji");
        NoteCreationDto dto = new NoteCreationDto();
        dto.setTitle("Note 👻 🎃");
        dto.setContent("Contenu spooky");

        mockMvc.perform(post("/api/notes").cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Note 👻 🎃"));
    }

}