package com.helha.backend.integrations;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbUser;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Folders - Controller IT")
public class FolderControllerIT extends AbstractSpookyIT {

    @Test
    @DisplayName("POST /api/folders - 201 - Crée un dossier racine")
    void create_shouldReturnCreated() throws Exception {
        DbUser user = persistUser("architect", "pass");
        Cookie jwt = jwtCookieFor(user);

        FolderCreationDto input = new FolderCreationDto();
        input.setName("Plans Secrets");

        mockMvc.perform(post("/api/folders")
                        .cookie(jwt)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Plans Secrets")));
    }

    @Test
    @DisplayName("GET /api/folders/tree - 200 - Récupère l'arborescence")
    void getTree_shouldReturnList() throws Exception {
        DbUser user = persistUser("botanist", "pass");
        Cookie jwt = jwtCookieFor(user);

        // On injecte un dossier en base
        DbFolder folder = new DbFolder();
        folder.setName("Racine");
        folder.setUser(user);
        folderRepository.save(folder);

        mockMvc.perform(get("/api/folders/tree").cookie(jwt))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name", is("Racine")));
    }
}