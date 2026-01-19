package com.helha.backend.infrastructure.database.repository;

import com.helha.backend.infrastructure.database.entities.DbFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IFolderRepository extends JpaRepository<DbFolder, Long> {
    // Récupère uniquement les racines (ceux sans parent) pour l'affichage initial
    List<DbFolder> findByParentIsNull();
}