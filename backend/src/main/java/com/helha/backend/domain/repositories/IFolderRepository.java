package com.helha.backend.domain.repositories;

import com.helha.backend.domain.models.DbFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface IFolderRepository extends JpaRepository<DbFolder, Long> {


    // Find active root folders for a specific user
    List<DbFolder> findByUserIdAndParentIsNullAndDeletedFalse(Long userId);
    // Find deleted folders for a specific user
    List<DbFolder> findByUserIdAndDeletedTrue(Long userId);
    // Find active folders for a specific user
    List<DbFolder> findByUserIdAndDeletedFalse(Long userId);
    // Find deleted folders where the deletion date is before a specific date
    List<DbFolder> findByDeletedTrueAndDeletedAtBefore(LocalDateTime thresholdDate);
}