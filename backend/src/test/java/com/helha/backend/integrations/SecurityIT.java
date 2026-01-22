package com.helha.backend.integrations;

import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.models.DbUser;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Security - Integration Tests")
public class SecurityIT extends AbstractSpookyIT {

    @Test
    @DisplayName("Accès refusé sans Cookie JWT")
    void requestWithoutCookie_shouldReturn403() throws Exception {
        mockMvc.perform(get("/api/notes"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Impossible de lire une note appartenant à un autre utilisateur (404)")
    void accessOtherUserNote_shouldReturnNotFound() throws Exception {
        // User A crée une note
        DbUser userA = persistUser("userA", "pass");
        DbNote noteA = new DbNote();
        noteA.setTitle("Secret A");
        noteA.setUser(userA);
        noteA = noteRepository.save(noteA);

        // User B tente d'y accéder
        DbUser userB = persistUser("userB", "pass");
        Cookie jwtB = jwtCookieFor(userB);

        mockMvc.perform(get("/api/notes/" + noteA.getId()).cookie(jwtB))
                .andExpect(status().isNotFound()); // Le service renvoie 404 pour ne pas fuiter l'existence
    }
}