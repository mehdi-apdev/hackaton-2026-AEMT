package com.helha.backend.application.dto;

import lombok.Data;

// dto to update a note
@Data
public class NoteUpdateDto {
    private String title;
    private String content;
}
