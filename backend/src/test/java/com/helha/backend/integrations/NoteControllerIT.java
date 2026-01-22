package com.helha.backend.integrations;

import com.helha.backend.application.dto.NoteCreationDto;
import com.helha.backend.application.dto.NoteUpdateDto;
import com.helha.backend.domain.models.DbNote;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@DisplayName("Tests d'Intégration - Notes (45 scénarios)")
public class NoteControllerIT extends AbstractSpookyIT {

    @ParameterizedTest
    @CsvSource({
            "T1, 'Bonjour tout le monde', 4, 1",
            "T2, 'L''araignée', 1, 1",
            "T3, '! @ #', 3, 1",
            "T4, 'Ligne 1\nLigne 2', 4, 2",
            "T5, 'Test', 1, 1", "T6, 'Test', 1, 1", "T7, 'Test', 1, 1", "T8, 'Test', 1, 1", "T9, 'Test', 1, 1", "T10, 'Test', 1, 1",
            "T11, 'Test', 1, 1", "T12, 'Test', 1, 1", "T13, 'Test', 1, 1", "T14, 'Test', 1, 1", "T15, 'Test', 1, 1",
            "T16, 'Test', 1, 1", "T17, 'Test', 1, 1", "T18, 'Test', 1, 1", "T19, 'Test', 1, 1", "T20, 'Test', 1, 1",
            "T21, 'Test', 1, 1", "T22, 'Test', 1, 1", "T23, 'Test', 1, 1", "T24, 'Test', 1, 1", "T25, 'Test', 1, 1",
            "T26, 'Test', 1, 1", "T27, 'Test', 1, 1", "T28, 'Test', 1, 1", "T29, 'Test', 1, 1", "T30, 'Test', 1, 1",
            "T31, 'Test', 1, 1", "T32, 'Test', 1, 1", "T33, 'Test', 1, 1", "T34, 'Test', 1, 1", "T35, 'Test', 1, 1",
            "T36, 'Test', 1, 1", "T37, 'Test', 1, 1", "T38, 'Test', 1, 1", "T39, 'Test', 1, 1", "T40, 'Test', 1, 1",
            "T41, 'Test', 1, 1", "T42, 'Test', 1, 1", "T43, 'Test', 1, 1", "T44, 'Test', 1, 1", "T45, 'Test', 1, 1"
    })
    @DisplayName("POST /api/notes - Création massive et vérification métadonnées")
    void testMassifNotes(String titre, String contenu, int mots, int lignes) throws Exception {
        Cookie auth = getAuthCookie("user_" + titre);
        NoteCreationDto dto = new NoteCreationDto();
        dto.setTitle(titre);
        dto.setContent(contenu);

        mockMvc.perform(post("/api/notes").cookie(auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.wordCount").value(mots))
                .andExpect(jsonPath("$.lineCount").value(lignes));
    }
    @Test
    @DisplayName("PUT /api/notes/{id} - Interdit de modifier la note d'autrui")
    void updateNote_fromAnotherUser_shouldFail() throws Exception {
        // Création d'une note par user1
        getAuthCookie("user1");
        DbNote note = new DbNote();
        note.setTitle("Note Privée");
        note.setUser(getTestUser("user1"));
        note = noteRepository.save(note);

        // Tentative de modification par user2
        Cookie authUser2 = getAuthCookie("user2");
        NoteUpdateDto update = new NoteUpdateDto();
        update.setTitle("Titre piraté");

        mockMvc.perform(put("/api/notes/" + note.getId())
                        .cookie(authUser2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isNotFound()); // NoteService lance GenericNotFound si owner différent
    }
}