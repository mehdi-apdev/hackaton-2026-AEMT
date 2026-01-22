package com.helha.backend.integrations;

import com.helha.backend.application.dto.NoteUpdateDto;
import com.helha.backend.domain.models.DbNote;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Tests d'Intégration - Sécurité Avancée (6 scénarios)")
public class SecurityAdvancedIT extends AbstractSpookyIT {

    @Test
    @DisplayName("PUT /api/notes/{id} - Interdit de modifier la note d'autrui")
    void updateNote_AnotherUser_Conflict() throws Exception {
        getAuthCookie("victime");
        DbNote note = new DbNote();
        note.setTitle("Note Privée");
        note.setUser(getTestUser("victime"));
        note = noteRepository.save(note);

        Cookie authPirate = getAuthCookie("pirate");
        NoteUpdateDto update = new NoteUpdateDto();
        update.setTitle("Hacké");

        mockMvc.perform(put("/api/notes/" + note.getId())
                        .cookie(authPirate)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isNotFound()); // Le service renvoie 404 si le propriétaire diffère
    }



    @Test
    @DisplayName("POST /api/corbeille/notes/{id}/restore - Interdit de restaurer la note d'autrui")
    void restoreNote_AnotherUser_Forbidden() throws Exception {
        getAuthCookie("victime");
        DbNote note = new DbNote();
        note.setTitle("Note Supprimée");
        note.setUser(getTestUser("victime"));
        note.setDeleted(true);
        note = noteRepository.save(note);

        Cookie authPirate = getAuthCookie("pirate");
        mockMvc.perform(post("/api/corbeille/notes/" + note.getId() + "/restore").cookie(authPirate))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/folders/{id} - Forbidden to delete someone else's folder")
    void deleteFolder_AnotherUser_Forbidden() throws Exception {
        // Use getAuthCookie to go through AuthService.register()
        // to ensure the root folder is created automatically.
        getAuthCookie("proprietaire");

        // Retrieve the root folder created for this new user
        var folders = folderRepository.findByUserIdAndParentIsNullAndDeletedFalse(
                getTestUser("proprietaire").getId()
        );

        // Safety check before running the test
        if (folders.isEmpty()) {
            throw new IllegalStateException("Root folder was not created for the user");
        }
        var folder = folders.get(0);

        // Attempt to delete the folder using another user's credentials
        Cookie authPirate = getAuthCookie("pirate");
        mockMvc.perform(delete("/api/folders/" + folder.getId())
                        .cookie(authPirate))
                .andExpect(status().isNotFound());
    }
}