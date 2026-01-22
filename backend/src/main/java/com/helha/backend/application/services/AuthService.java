package com.helha.backend.application.services;

import com.helha.backend.application.dto.AuthRequestDto;
import com.helha.backend.domain.models.DbUser;
import com.helha.backend.domain.repositories.IUserRepository;
import com.helha.backend.infrastructure.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
// authentificates a user and return a JWT if valid
@Service
@RequiredArgsConstructor
public class AuthService {

    private final IUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    //create a user
    public void register(AuthRequestDto request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            //throw an exeception if the user already exists
            throw new RuntimeException("Ce nom d'utilisateur est déjà pris !");
        }
        //save the infos in a DbUser object
        DbUser user = new DbUser();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);
    }

    //login into a account (user)
    public String login(AuthRequestDto request) {
        // Attempt to authenticate the user using Spring Security's AuthenticationManager
        authenticationManager.authenticate(
                // Create an internal authentication object with the provided credentials
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        // If authentication succeeds, generate and return a secure JWT token
        return jwtUtils.generateToken(request.getUsername());
    }
}