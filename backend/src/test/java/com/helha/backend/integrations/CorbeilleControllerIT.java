package com.helha.backend.integrations;

import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.models.DbUser;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Corbeille - Controller IT")
public class CorbeilleControllerIT extends AbstractSpookyIT {

    @Test
    @DisplayName("Folder Lifecycle: Soft Delete -> Verify Bin -> Restore")
    void folderLifecycle_shouldWork() throws Exception {
        // 1. Setup
        DbUser user = persistUser("folderUser", "pass");
        Cookie jwt = jwtCookieFor(user);

        DbFolder folder = new DbFolder();
        folder.setName("Dossier Corbeille");
        folder.setUser(user);
        folder = folderRepository.save(folder);

        // 2. Action: Soft Delete via FolderController
        mockMvc.perform(delete("/api/folders/" + folder.getId()).cookie(jwt))
                .andExpect(status().isNoContent());

        // 3. GET /api/corbeille/folders - Verify it's in the bin
        mockMvc.perform(get("/api/corbeille/folders").cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Dossier Corbeille")));

        // 4. POST /api/corbeille/folders/{id}/restore - Restore it
        mockMvc.perform(post("/api/corbeille/folders/" + folder.getId() + "/restore").cookie(jwt))
                .andExpect(status().isOk());

        // 5. DELETE /api/corbeille/folders/{id} - Test hard delete (after putting it back in bin)
        mockMvc.perform(delete("/api/folders/" + folder.getId()).cookie(jwt)).andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/corbeille/folders/" + folder.getId()).cookie(jwt))
                .andExpect(status().isNoContent());

        // 6. Verify bin is empty
        mockMvc.perform(get("/api/corbeille/folders").cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    @DisplayName("Note Lifecycle: Soft Delete -> Verify Bin -> Hard Delete")
    void noteLifecycle_shouldWork() throws Exception {
        // 1. Setup
        DbUser user = persistUser("noteUser", "pass");
        Cookie jwt = jwtCookieFor(user);

        DbNote note = new DbNote();
        note.setTitle("Note Corbeille");
        note.setContent("Content");
        note.setUser(user);
        note = noteRepository.save(note);

        // 2. Action: Soft Delete via NoteController
        mockMvc.perform(delete("/api/notes/" + note.getId()).cookie(jwt))
                .andExpect(status().isNoContent());

        // 3. GET /api/corbeille - Verify it's in the bin
        mockMvc.perform(get("/api/corbeille").cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Note Corbeille")));

        // 4. POST /api/corbeille/notes/{id}/restore - Restore it
        mockMvc.perform(post("/api/corbeille/notes/" + note.getId() + "/restore").cookie(jwt))
                .andExpect(status().isOk());

        // 5. DELETE /api/corbeille/notes/{id} - Test permanent delete
        mockMvc.perform(delete("/api/notes/" + note.getId()).cookie(jwt)).andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/corbeille/notes/" + note.getId()).cookie(jwt))
                .andExpect(status().isNoContent());

        // 6. Verify bin is empty
        mockMvc.perform(get("/api/corbeille").cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }
}