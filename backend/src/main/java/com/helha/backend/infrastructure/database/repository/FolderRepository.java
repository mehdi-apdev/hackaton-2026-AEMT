package com.helha.backend.infrastructure.database.repository;

import com.helha.backend.infrastructure.database.entities.Folder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FolderRepository extends JpaRepository<Folder, Long> {
    // Récupère uniquement les racines (ceux sans parent) pour l'affichage initial
    List<Folder> findByParentIsNull();
}