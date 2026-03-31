package com.helha.backend.integrations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.helha.backend.application.dto.AuthRequestDto;
import com.helha.backend.application.services.AuthService;
import com.helha.backend.domain.models.DbUser;
import com.helha.backend.domain.repositories.IFolderRepository;
import com.helha.backend.domain.repositories.INoteRepository;
import com.helha.backend.domain.repositories.IUserRepository;
import com.helha.backend.infrastructure.security.JwtUtils;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
public abstract class AbstractSpookyIT {
    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;
    @Autowired protected IUserRepository userRepository;
    @Autowired protected IFolderRepository folderRepository;
    @Autowired protected INoteRepository noteRepository;
    @Autowired protected AuthService authService;
    @Autowired protected JwtUtils jwtUtils;
    @Autowired protected PasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        noteRepository.deleteAll();
        folderRepository.deleteAll();
        userRepository.deleteAll();
    }

    protected void persistUser(String username, String password) {
        DbUser user = new DbUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    protected DbUser getTestUser(String username) {
        return userRepository.findByUsername(username).orElseThrow();
    }

    protected Cookie getAuthCookie(String username) {
        AuthRequestDto dto = new AuthRequestDto();
        dto.setUsername(username);
        dto.setPassword("password123");
        authService.register(dto);
        String token = jwtUtils.generateToken(username);
        return new Cookie("token", token);
    }
}