package com.helha.backend.application.dto;

import lombok.Data;

import java.util.List;

@Data
public class FolderDto {
    private Long id;
    private String name;

    // Permet la structure en arbre
    private List<FolderDto> children;
    // Les notes contenus dans dossier
    private List<NoteDto> notes;


}
