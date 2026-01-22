package com.helha.backend.application.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
//dto to create a note
@Data
public class NoteCreationDto {
    @NotBlank(message = "Le titre est obligatoire")
    private String title;
    private String content;
    private Long folderId;
}
