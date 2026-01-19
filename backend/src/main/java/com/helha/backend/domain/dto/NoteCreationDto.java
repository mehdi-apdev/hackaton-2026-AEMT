package com.helha.backend.domain.dto;

import lombok.Data;

@Data
public class NoteCreationDto {
    private String title;
    private Long folderId;
}
