package com.helha.backend.application.dto;

import lombok.Data;

@Data
public class FolderCreationDto {
    private String name;
    // Peut être null si c'est un dossier racine
    private Long parentId;
}
