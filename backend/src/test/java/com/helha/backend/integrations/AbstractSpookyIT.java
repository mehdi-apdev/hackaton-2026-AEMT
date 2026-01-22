package com.helha.backend.integrations;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.helha.backend.TestcontainersConfiguration;
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
import org.springframework.context.annotation.Import;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

@Import(TestcontainersConfiguration.class) // Force l'utilisation de Docker
@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.jpa.hibernate.ddl-auto=create-drop",
                "spring.jpa.show-sql=false"
        }
)
@AutoConfigureMockMvc
public abstract class AbstractSpookyIT {

    @Autowired protected MockMvc mockMvc;
    @Autowired protected ObjectMapper objectMapper;

    @Autowired protected IUserRepository userRepository;
    @Autowired protected INoteRepository noteRepository;
    @Autowired protected IFolderRepository folderRepository;

    @Autowired protected JwtUtils jwtUtils;
    @Autowired protected PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanDb() {
        // Nettoyage complet de la base Docker avant chaque test
        noteRepository.deleteAll();
        folderRepository.deleteAll();
        userRepository.deleteAll();
    }

    // Helper utilisé par tous les tests pour créer un utilisateur rapidement
    protected DbUser persistUser(String username, String password) {
        DbUser user = new DbUser();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("USER");
        return userRepository.save(user);
    }

    protected Cookie jwtCookieFor(DbUser savedUser) {
        String token = jwtUtils.generateToken(savedUser.getUsername());
        return new Cookie("token", token);
    }
}