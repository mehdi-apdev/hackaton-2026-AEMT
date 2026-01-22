package com.helha.backend.application.dto;

import lombok.Data;
import java.time.LocalDateTime;

//dto for representing a note and its content.
@Data
public class NoteDto {
    private  Long id;
    private String title;
    private String content;
    private Long folderId;

    //for all counting methods neeeded
    private int wordCount;
    private int lineCount;
    private int characterCount;
    private long sizeInBytes;

    //for the dates
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
