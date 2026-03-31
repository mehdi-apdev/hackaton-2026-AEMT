package com.helha.backend.integrations;

import com.helha.backend.domain.models.DbNote;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Tests d'Intégration - Corbeille et Sécurité")
public class CorbeilleIT extends AbstractSpookyIT {

    @Test
    @DisplayName("DELETE /api/notes/{id} - Mettre une note en corbeille")
    void softDelete_Succes() throws Exception {
        Cookie auth = getAuthCookie("user_del");
        DbNote note = new DbNote();
        note.setTitle("A supprimer");
        note.setUser(getTestUser("user_del"));
        note = noteRepository.save(note);

        mockMvc.perform(delete("/api/notes/" + note.getId()).cookie(auth))
                .andExpect(status().isNoContent());

        assert(noteRepository.findById(note.getId()).get().isDeleted());
    }
    @Test
    @DisplayName("GET /api/corbeille - Doit retourner 403 (ou 401) sans jeton")
    void corbeille_SansToken_Echec() throws Exception {
        mockMvc.perform(get("/api/corbeille"))
                .andExpect(status().isForbidden()); // Change 401 en 403 (isForbidden)
    }

}