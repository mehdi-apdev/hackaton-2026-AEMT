package com.helha.backend.infrastructure.database.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "NOTES")
@Data
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DbNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    // --- Métadonnées demandées (Palier Zombie) ---
    //
    private int wordCount;      // Nombre de mots
    private int lineCount;      // Nombre de lignes
    private int characterCount; // Nombre de caractères
    private long sizeInBytes;   // Taille en octets

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id", nullable = false)
    @JsonIgnoreProperties("dbNotes")
    private DbFolder folder;

    public DbNote(String title, String content, DbFolder folder) {
        this.title = title;
        this.content = content;
        this.folder = folder;
    }
}