package com.helha.backend.application.dto;

import lombok.Data;
import java.util.List;


//dto for representing a folder and its content.

@Data
public class FolderDto {
    private Long id;
    private String name;

    //Recursive list of sub-folders to support a tree hierarchy
    private List<FolderDto> children;

    // List of notes in this folder
    private List<NoteDto> notes;
}