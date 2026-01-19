package com.helha.backend.infrastructure.database.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "FOLDERS")
@Data
@NoArgsConstructor
public class DbFolder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // --- ANTI-BOUCLE INFINIE ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore // Empêche l'enfant de renvoyer le parent en JSON
    private DbFolder parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DbFolder> children = new ArrayList<>();

    // mappedBy = "folder" car c'est le nom de la variable dans DbNote
    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DbNote> dbNotes = new ArrayList<>();

    public DbFolder(String name, DbFolder parent) {
        this.name = name;
        this.parent = parent;
    }
}