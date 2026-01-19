package com.helha.backend.infrastructure.database.repository;

import com.helha.backend.infrastructure.database.entities.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    // Trouve toutes les notes d'un dossier spécifique
    List<Note> findByFolderId(Long folderId);
}