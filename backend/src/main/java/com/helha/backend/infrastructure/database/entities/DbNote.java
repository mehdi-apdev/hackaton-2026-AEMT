package com.helha.backend.infrastructure.database.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
// ... autres imports

@Entity
@Table(name = "NOTES")
@Data
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class DbNote {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id") // Pour le hackathon, on peut laisser nullable=true temporairement si tu as déjà des données, sinon nullable=false
    private DbUser user;



    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    //Métadata
    private int wordCount;      // Number of words
    private int lineCount;      // Number of lines
    private int characterCount; // Number of Characters
    private long sizeInBytes;   // Size in byte

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