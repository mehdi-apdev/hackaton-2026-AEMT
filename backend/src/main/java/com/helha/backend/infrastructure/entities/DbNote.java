package com.helha.backend.infrastructure.entities;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class DbNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(columnDefinition = "TEXT") // Pour les longs textes Markdown
    private String content;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int wordCount;

    @ManyToOne // Une note appartient à un dossier
    private DbFolder folder;
}