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
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private DbUser user;

    @Column(nullable = false)
    private String name;

    private boolean deleted = false;
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnore
    private DbFolder parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DbFolder> children = new ArrayList<>();

    @OneToMany(mappedBy = "folder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DbNote> dbNotes = new ArrayList<>();

    public DbFolder(String name, DbFolder parent, DbUser user) {
        this.name = name;
        this.parent = parent;
        this.user = user;
    }
}