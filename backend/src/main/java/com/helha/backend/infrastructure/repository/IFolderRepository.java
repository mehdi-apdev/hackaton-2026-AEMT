package com.helha.backend.infrastructure.repository;


import com.helha.backend.infrastructure.entities.DbFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IFolderRepository extends JpaRepository<DbFolder, Long> {

    // Pour plus tard : trouver les dossiers enfants d'un dossier parent
    List<DbFolder> findByParentFolderId(Long parentId);
}