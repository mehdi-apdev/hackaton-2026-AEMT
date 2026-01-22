package com.helha.backend.integrations;

import com.helha.backend.application.dto.NoteCreationDto;
import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.models.DbUser;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

// --- LES IMPORTS IMPORTANTS SONT ICI ---
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete; // N'oubliez pas delete !
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
// ---------------------------------------

@DisplayName("Notes - Controller IT")
public class NoteControllerIT extends AbstractSpookyIT {

    @Test
    @DisplayName("GET /api/notes/{id} - 200 - Récupère une note existante")
    void getNote_shouldReturnOk() throws Exception {
        // 1. Setup
        DbUser user = persistUser("zombieHunter", "password123");
        Cookie jwt = jwtCookieFor(user);

        // Dossier obligatoire
        DbFolder folder = new DbFolder();
        folder.setName("Dossier Test");
        folder.setUser(user);
        folder = folderRepository.save(folder);

        // Note
        DbNote note = new DbNote();
        note.setTitle("Ma Note");
        note.setContent("Contenu effrayant");
        note.setUser(user);
        note.setFolder(folder);
        note.setWordCount(2);
        note.setLineCount(1);
        note.setCharacterCount(15);
        note.setSizeInBytes(15L);
        note = noteRepository.save(note);

        // 2. Test
        mockMvc.perform(get("/api/notes/" + note.getId()).cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title", is("Ma Note")));
    }

    @Test
    @DisplayName("GET /api/notes/999 - 404 - Note inexistante")
    void getNote_NotFound() throws Exception {
        DbUser user = persistUser("lost", "pass");
        Cookie jwt = jwtCookieFor(user);

        mockMvc.perform(get("/api/notes/999").cookie(jwt))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /api/notes/export/zip - 200 - Télécharge le ZIP")
    void downloadZip_shouldReturnOk() throws Exception {
        DbUser user = persistUser("archivist", "pass");
        Cookie jwt = jwtCookieFor(user);

        // L'erreur venait d'ici car 'get' était le mauvais import
        mockMvc.perform(get("/api/notes/export/zip").cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/zip"));
    }

    @Test
    @DisplayName("POST /api/notes - 201 - Crée une nouvelle note")
    void createNote_shouldReturnCreated() throws Exception {
        DbUser user = persistUser("writer", "pass");
        Cookie jwt = jwtCookieFor(user);

        // On crée d'abord un dossier pour la note
        DbFolder folder = new DbFolder();
        folder.setName("Mon Roman");
        folder.setUser(user);
        folder = folderRepository.save(folder);

        NoteCreationDto input = new NoteCreationDto();
        input.setTitle("Nouvelle Histoire");
        input.setContent("Il était une fois...");
        input.setFolderId(folder.getId()); // On lie la note au dossier

        mockMvc.perform(post("/api/notes")
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Nouvelle Histoire")));
    }

    @Test
    @DisplayName("Bin - Lifecycle: Delete -> Bin -> Restore")
    void binLifecycle_shouldWork() throws Exception {
        // 1. Create a note
        DbUser user = persistUser("recycleUser", "pass");
        Cookie jwt = jwtCookieFor(user);

        var folder = new com.helha.backend.domain.models.DbFolder();
        folder.setName("RecycleBin Test");
        folder.setUser(user);
        folder = folderRepository.save(folder);

        com.helha.backend.domain.models.DbNote note = new com.helha.backend.domain.models.DbNote();
        note.setTitle("Trash me");
        note.setContent("Trash content");
        note.setUser(user);
        note.setFolder(folder);
        // Stats
        note.setWordCount(1); note.setLineCount(1); note.setCharacterCount(5); note.setSizeInBytes(5);
        note = noteRepository.save(note);

        // 2. Soft Delete (Move to bin) via DELETE /api/notes/{id}
        // Assurez-vous d'avoir importé static ...MockMvcRequestBuilders.delete;
        mockMvc.perform(delete("/api/notes/" + note.getId()).cookie(jwt))
                .andExpect(status().isNoContent());

        // 3. Verify it is in the bin
        mockMvc.perform(get("/api/bin").cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title", is("Trash me")));

        // 4. Restore
        mockMvc.perform(post("/api/bin/notes/" + note.getId() + "/restore").cookie(jwt))
                .andExpect(status().isOk());

        // 5. Verify it is NO LONGER in the bin
        mockMvc.perform(get("/api/bin").cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}