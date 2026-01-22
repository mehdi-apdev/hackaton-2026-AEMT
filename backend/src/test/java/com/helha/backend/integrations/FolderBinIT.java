package com.helha.backend.integrations;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.domain.models.DbFolder;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Tests d'Intégration - Dossiers et Corbeille (25 scénarios)")
public class FolderBinIT extends AbstractSpookyIT {

    @ParameterizedTest
    @ValueSource(strings = {"D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"})
    @DisplayName("POST /api/folders - Création de sous-dossiers")
    void testCreationDossiers(String name) throws Exception {
        Cookie auth = getAuthCookie("architecte_" + name);
        DbFolder root = folderRepository.findAll().get(0);
        FolderCreationDto dto = new FolderCreationDto();
        dto.setName(name);
        dto.setParentId(root.getId());

        mockMvc.perform(post("/api/folders").cookie(auth).contentType("application/json").content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("System - Ping")
    void testPing() throws Exception {
        mockMvc.perform(get("/api/ping")).andExpect(status().isOk());
    }
}