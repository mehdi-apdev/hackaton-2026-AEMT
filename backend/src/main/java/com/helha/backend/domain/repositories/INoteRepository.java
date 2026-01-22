package com.helha.backend.domain.repositories;

import com.helha.backend.domain.models.DbNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface INoteRepository extends JpaRepository<DbNote, Long> {

    // --- RECHERCHE DE BASE ---
    List<DbNote> findByUserId(Long userId);
    List<DbNote> findByFolderId(Long folderId);

    // --- RECHERCHE ACTIVE (Hors corbeille) ---
    List<DbNote> findByUserIdAndDeletedFalse(Long userId);
    List<DbNote> findByFolderIdAndDeletedFalse(Long folderId);

    // Notes à la racine (si tu n'utilises pas le dossier "Ma Racine")
    List<DbNote> findByUserIdAndFolderIsNullAndDeletedFalse(Long userId);

    // --- CORBEILLE ---
    List<DbNote> findByUserIdAndDeletedTrue(Long userId);

    // Pour le nettoyage automatique
    List<DbNote> findByDeletedTrueAndDeletedAtBefore(LocalDateTime thresholdDate);
}