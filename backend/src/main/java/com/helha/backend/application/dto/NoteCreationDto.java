package com.helha.backend.application.dto;

import lombok.Data;

@Data
public class NoteCreationDto {
    private String title;
    private String content;
    private Long folderId;
}
