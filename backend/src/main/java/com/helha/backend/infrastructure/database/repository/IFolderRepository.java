package com.helha.backend.infrastructure.database.repository;

import com.helha.backend.infrastructure.database.entities.DbFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IFolderRepository extends JpaRepository<DbFolder, Long> {
    List<DbFolder> findByUserId(Long userId);
    List<DbFolder> findByUserIdAndParentIsNull(Long userId); // we need that to get the tree's root
}