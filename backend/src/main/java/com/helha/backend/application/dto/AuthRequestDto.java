package com.helha.backend.application.dto;

import lombok.Data;
// DTO for authentification
@Data
public class AuthRequestDto {
    private String username;
    private String password;
}