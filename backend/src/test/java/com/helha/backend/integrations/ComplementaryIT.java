package com.helha.backend.integrations;

import com.helha.backend.application.dto.FolderUpdateDto;
import com.helha.backend.application.dto.NoteCreationDto;
import com.helha.backend.domain.models.DbFolder;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Tests d'Intégration - Compléments (6 scénarios)")
public class ComplementaryIT extends AbstractSpookyIT {

    @Test
    @DisplayName("POST /api/auth/logout - Doit supprimer le cookie de session")
    void logout_shouldClearCookie() throws Exception {
        mockMvc.perform(post("/api/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("token", 0)); // Vérifie que le cookie expire immédiatement
    }

    @Test
    @DisplayName("GET /api/corbeille/folders - Lister les dossiers supprimés")
    void getBinFolders_shouldReturnList() throws Exception {
        Cookie auth = getAuthCookie("binUserFolder");
        DbFolder folder = new DbFolder();
        folder.setName("Dossier à jeter");
        folder.setUser(getTestUser("binUserFolder"));
        folder.setDeleted(true);
        folderRepository.save(folder);

        mockMvc.perform(get("/api/corbeille/folders").cookie(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Dossier à jeter")); //
    }

    @Test
    @DisplayName("POST /api/corbeille/folders/{id}/restore - Restaurer un dossier")
    void restoreFolder_shouldWork() throws Exception {
        Cookie auth = getAuthCookie("restoreFolderUser");
        DbFolder folder = new DbFolder();
        folder.setName("Dossier Perdu");
        folder.setUser(getTestUser("restoreFolderUser"));
        folder.setDeleted(true);
        folder = folderRepository.save(folder);

        mockMvc.perform(post("/api/corbeille/folders/" + folder.getId() + "/restore").cookie(auth))
                .andExpect(status().isOk());

        assert(!folderRepository.findById(folder.getId()).get().isDeleted()); //
    }

    @Test
    @DisplayName("DELETE /api/corbeille/folders/{id} - Suppression définitive d'un dossier")
    void permanentDeleteFolder_shouldWork() throws Exception {
        Cookie auth = getAuthCookie("hardDeleteUser");
        DbFolder folder = new DbFolder();
        folder.setName("Adieu");
        folder.setUser(getTestUser("hardDeleteUser"));
        folder = folderRepository.save(folder);

        mockMvc.perform(delete("/api/corbeille/folders/" + folder.getId()).cookie(auth))
                .andExpect(status().isNoContent());

        assert(folderRepository.findById(folder.getId()).isEmpty()); //
    }

    @Test
    @DisplayName("PUT /api/folders/{id} - 404 si le dossier à modifier n'existe pas")
    void updateFolder_NotFound_Returns404() throws Exception {
        Cookie auth = getAuthCookie("user_404");
        FolderUpdateDto update = new FolderUpdateDto();
        update.setName("Nouveau");

        mockMvc.perform(put("/api/folders/9999")
                        .cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isNotFound()); // Vérifie la gestion d'erreur
    }

    @Test
    @DisplayName("POST /api/notes - Vérification du calcul lineCount avec plusieurs sauts de ligne")
    void createNote_VerifyMetadata_Lines() throws Exception {
        Cookie auth = getAuthCookie("user_metadata");
        NoteCreationDto dto = new NoteCreationDto();
        dto.setTitle("Test Lignes");
        dto.setContent("Ligne 1\n\nLigne 3"); // 3 lignes au total

        mockMvc.perform(post("/api/notes").cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.lineCount").value(3)); // Vérifie MetadataUtils via l'API
    }
}