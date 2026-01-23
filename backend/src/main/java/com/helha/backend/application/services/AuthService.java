package com.helha.backend.application.services;

import com.helha.backend.application.dto.AuthRequestDto;
import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbUser;
import com.helha.backend.domain.repositories.IFolderRepository;
import com.helha.backend.domain.repositories.IUserRepository;
import com.helha.backend.infrastructure.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final IUserRepository userRepository;
    private final IFolderRepository folderRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    /**
     * Registers a new user and pre-creates a root folder.
     * @param request The authentication request containing username and password.
     * @throws RuntimeException if the username is already taken.
     */
    @Transactional
    public void register(AuthRequestDto request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("Ce nom d'utilisateur est déjà pris !");
        }

        DbUser user = new DbUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        DbUser savedUser = userRepository.save(user);

        // Pre-create the root folder "Ma bibliothèque"
        DbFolder rootFolder = new DbFolder();
        rootFolder.setName("Ma bibliothèque");
        rootFolder.setUser(savedUser);
        rootFolder.setParent(null);

        folderRepository.save(rootFolder);
    }

    /**
     * Authenticates a user and generates a JWT token upon successful login.
     * @param request The authentication request containing username and password.
     * @return A JWT token if authentication is successful.
     * @throws RuntimeException if authentication fails.
     */
    public String login(AuthRequestDto request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        return jwtUtils.generateToken(request.getUsername());
    }
}