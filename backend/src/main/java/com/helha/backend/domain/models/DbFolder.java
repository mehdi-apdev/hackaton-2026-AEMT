package com.helha.backend.domain.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
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

    @Column(nullable = false)
    private boolean deleted = false; // By default, the note is not deleted


    @Column
    private LocalDateTime deletedAt;


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