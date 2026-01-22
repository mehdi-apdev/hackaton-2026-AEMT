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
     * Registers a new user and automatically creates their default root folder.
     * Transactional ensures both user and folder are created or none.
     */
    @Transactional
    public void register(AuthRequestDto request) {
        // Check if the username is already taken
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("This username is already taken!");
        }

        // 1. Create and save the new user
        DbUser user = new DbUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        DbUser savedUser = userRepository.save(user);

        // 2. Create the default root folder for the new user
        DbFolder rootFolder = new DbFolder();
        rootFolder.setName("Ma bibliothèque");
        rootFolder.setUser(savedUser); // Link the folder to the saved user
        rootFolder.setParent(null);    // Root folder has no parent
        rootFolder.setDeleted(false);  // Ensure it is active

        folderRepository.save(rootFolder);
    }

    /**
     * Authenticates a user and returns a JWT token.
     */
    public String login(AuthRequestDto request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        return jwtUtils.generateToken(request.getUsername());
    }
}