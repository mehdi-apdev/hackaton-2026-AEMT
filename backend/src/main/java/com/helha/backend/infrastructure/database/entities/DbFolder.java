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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private DbUser user;


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    //to prevent an infinite loop
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore //prevent the child to send back the parent in json
    private DbFolder parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DbFolder> children = new ArrayList<>();

    //folder because it's the variable name in DbNote
    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DbNote> dbNotes = new ArrayList<>();

    public DbFolder(String name, DbFolder parent) {
        this.name = name;
        this.parent = parent;
    }
}