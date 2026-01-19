package com.helha.backend.infrastructure.repository;

import com.helha.backend.infrastructure.entities.DbNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INoteRepository extends JpaRepository<DbNote, Long> {

    // Pour plus tard : lister toutes les notes d'un dossier précis
    List<DbNote> findByFolderId(Long folderId);

    // Pour la recherche (si tu veux un bonus)
    List<DbNote> findByNameContainingIgnoreCase(String name);
}
