package com.helha.backend.integrations;

import com.helha.backend.domain.models.DbNote;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Tests d'Intégration - Sécurité et Propriété")
public class SecurityIT extends AbstractSpookyIT {

    @Test
    @DisplayName("GET /api/notes/{id} - Doit retourner 404 si la note appartient à un autre utilisateur")
    void getNote_fromAnotherUser_shouldFail() throws Exception {
        // User 1 creates a note
        getAuthCookie("user1");
        DbNote note = new DbNote();
        note.setTitle("Secret de User 1");
        note.setUser(getTestUser("user1"));
        note = noteRepository.save(note);

        // User 2 tries to access User 1's note
        Cookie authUser2 = getAuthCookie("user2");

        mockMvc.perform(get("/api/notes/" + note.getId())
                        .cookie(authUser2))
                .andExpect(status().isNotFound()); // Ownership check triggers NotFound
    }
}