package com.helha.backend.integrations;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.application.dto.FolderUpdateDto;
import com.helha.backend.domain.models.DbFolder;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Tests d'Intégration - Contrôleur des Dossiers")
public class FolderControllerIT extends AbstractSpookyIT {

    @Test
    @DisplayName("POST /api/folders - Créer un sous-dossier dans Ma bibliothèque")
    void creerSousDossier_Succes() throws Exception {
        Cookie auth = getAuthCookie("architecte");
        DbFolder root = folderRepository.findAll().get(0);

        FolderCreationDto input = new FolderCreationDto();
        input.setName("Secrets");
        input.setParentId(root.getId());

        mockMvc.perform(post("/api/folders").cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Secrets"));
    }

    @Test
    @DisplayName("PUT /api/folders/{id} - Renommer un dossier existant")
    void renommerDossier_Succes() throws Exception {
        Cookie auth = getAuthCookie("renommer_user");
        DbFolder root = folderRepository.findAll().get(0);

        FolderUpdateDto update = new FolderUpdateDto();
        update.setName("Nouveau Nom");

        mockMvc.perform(put("/api/folders/" + root.getId()).cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Nouveau Nom"));
    }
}