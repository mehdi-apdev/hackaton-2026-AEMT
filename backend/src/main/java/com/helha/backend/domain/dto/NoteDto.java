package com.helha.backend.domain.dto;

import lombok.Data;

@Data
public class NoteDto {
    private  Long id;
    private String title;
    private String content;
    private Long folderId;

}
