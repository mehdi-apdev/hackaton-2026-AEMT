package com.helha.backend.domain.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing a user in the database.
 * Includes fields for username, password (hashed), and role.
 * Used for authentication and authorization.
 */
@Entity
@Table(name = "USERS")
@Data
@NoArgsConstructor
public class DbUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password; // Hashed

    private String role = "USER";
}