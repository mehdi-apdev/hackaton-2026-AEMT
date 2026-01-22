package com.helha.backend.domain.repositories;

import com.helha.backend.domain.models.DbFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IFolderRepository extends JpaRepository<DbFolder, Long> {


    List<DbFolder> findByUserIdAndParentIsNullAndDeletedFalse(Long userId);
    List<DbFolder> findByUserIdAndDeletedTrue(Long userId);
    List<DbFolder> findByUserIdAndDeletedFalse(Long userId);
    // Find deleted folders where the deletion date is before a specific date
    List<DbFolder> findByDeletedTrueAndDeletedAtBefore(LocalDateTime thresholdDate);
    Optional<DbFolder> findByUserIdAndParentIsNull(Long userId);
}