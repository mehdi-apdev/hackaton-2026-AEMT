package com.helha.backend.application.dto;

import lombok.Data;
//dto for folder creation
@Data
public class FolderCreationDto {
    private String name;
    // can be null if he's a parent folder
    private Long parentId;
}
