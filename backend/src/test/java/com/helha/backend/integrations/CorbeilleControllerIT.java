package com.helha.backend.integrations;

import com.helha.backend.domain.models.DbNote;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Tests d'Intégration - Corbeille")
public class CorbeilleControllerIT extends AbstractSpookyIT {

    @Test
    @DisplayName("GET /api/corbeille - Lister les notes supprimées")
    void getDeletedNotes_shouldReturnList() throws Exception {
        Cookie auth = getAuthCookie("binUser");

        DbNote note = new DbNote();
        note.setTitle("Note Perdue");
        note.setUser(getTestUser("binUser"));
        note.setDeleted(true); // Mise en corbeille
        noteRepository.save(note);

        mockMvc.perform(get("/api/corbeille")
                        .cookie(auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Note Perdue"));
    }

    @Test
    @DisplayName("POST /api/corbeille/notes/{id}/restore - Restaurer une note")
    void restoreNote_shouldWork() throws Exception {
        Cookie auth = getAuthCookie("restoreUser");

        DbNote note = new DbNote();
        note.setTitle("A restaurer");
        note.setUser(getTestUser("restoreUser"));
        note.setDeleted(true);
        note = noteRepository.save(note);

        mockMvc.perform(post("/api/corbeille/notes/" + note.getId() + "/restore")
                        .cookie(auth))
                .andExpect(status().isOk());

        // Vérification en base
        assert(!noteRepository.findById(note.getId()).get().isDeleted());
    }
}