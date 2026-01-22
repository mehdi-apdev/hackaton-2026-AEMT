package com.helha.backend.domain.repositories;

import com.helha.backend.domain.models.DbFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IFolderRepository extends JpaRepository<DbFolder, Long> {

    // --- RECHERCHE DE BASE ---
    List<DbFolder> findByUserId(Long userId);
    List<DbFolder> findByUserIdAndDeletedFalse(Long userId);

    // --- LOGIQUE RACINE ---
    // Vérifie si une racine active existe
    boolean existsByUserIdAndParentIsNullAndDeletedFalse(Long userId);

    // Trouve l'unique racine active (utilisé pour l'arbre et les notes par défaut)
    Optional<DbFolder> findByUserIdAndParentIsNullAndDeletedFalse(Long userId);

    // Trouve la racine indépendamment de l'état deleted (utile pour certains checks internes)
    Optional<DbFolder> findByUserIdAndParentIsNull(Long userId);

    // --- CORBEILLE ---
    List<DbFolder> findByUserIdAndDeletedTrue(Long userId);

    // Pour le nettoyage automatique (DataSeeder ou Scheduled task)
    List<DbFolder> findByDeletedTrueAndDeletedAtBefore(LocalDateTime thresholdDate);
}