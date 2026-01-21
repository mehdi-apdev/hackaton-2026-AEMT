package com.helha.backend.application.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class NoteDto {
    private  Long id;
    private String title;
    private String content;
    private Long folderId;

    //les compteurs
    private int wordCount;
    private int lineCount;
    private int characterCount;
    private long sizeInBytes;

    //les dates
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
