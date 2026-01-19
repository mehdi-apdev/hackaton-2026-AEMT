package com.helha.backend.application.dto;

import lombok.Data;

@Data
public class NoteDto {
    private  Long id;
    private String title;
    private String content;
    private Long folderId;

}
