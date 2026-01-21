package com.helha.backend.controllers;

import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.application.services.ExportService;
import com.helha.backend.application.services.NoteService;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class NoteControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NoteService noteService;

    @MockBean
    private ExportService exportService;

    // Test CODE 401 : Accès non autorisé (Pas de token)
    @Test
    void shouldReturn401_WhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/notes/1"))
                .andExpect(status().isUnauthorized()); // Vérifie le code 401
    }

    // Test CODE 200 : Succès (Note trouvée)
    @Test
    @WithMockUser(username = "zombieHunter")
    void shouldReturn200_WhenNoteExists() throws Exception {
        NoteDto mockNote = new NoteDto();
        mockNote.setId(1L);
        mockNote.setTitle("Note de Test");
        mockNote.setContent("Boo!");

        when(noteService.getNoteById(1L)).thenReturn(mockNote);

        mockMvc.perform(get("/api/notes/1"))
                .andExpect(status().isOk()) // Vérifie le code 200
                .andExpect(jsonPath("$.title").value("Note de Test"));
    }

    // Test CODE 404 : Ressource non trouvée
    @Test
    @WithMockUser(username = "zombieHunter")
    void shouldReturn404_WhenNoteNotFound() throws Exception {
        // On simule que le service lance une exception "Non Trouvé" pour l'ID 999
        when(noteService.getNoteById(999L))
                .thenThrow(new GenericNotFoundException(999L, "Note"));

        mockMvc.perform(get("/api/notes/999"))
                .andExpect(status().isNotFound()); // Vérifie le code 404
    }
}