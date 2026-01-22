package com.helha.backend.integrations;

import com.helha.backend.application.dto.AuthRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@DisplayName("Integration Tests - Authentification")
public class AuthControllerIT extends AbstractSpookyIT {

    @Test
    @DisplayName("POST /register - 201 Created")
    void register_shouldReturnCreated() throws Exception {
        AuthRequestDto input = new AuthRequestDto();
        input.setUsername("newUser");
        input.setPassword("password123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(input)))
                .andExpect(status().isCreated());
    }

    @Test
    @DisplayName("POST /login - 200 OK + Cookie")
    void login_shouldReturnOk_andSetCookie() throws Exception {
        persistUser("existingUser", "password123");

        AuthRequestDto loginData = new AuthRequestDto();
        loginData.setUsername("existingUser");
        loginData.setPassword("password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginData)))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("token=")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")));
    }
}