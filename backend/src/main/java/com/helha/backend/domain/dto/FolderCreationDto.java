package com.helha.backend.domain.dto;

import lombok.Data;

@Data
public class FolderCreationDto {
    private String name;
    // Peut être null si c'est un dossier racine
    private Long parentId;
}
