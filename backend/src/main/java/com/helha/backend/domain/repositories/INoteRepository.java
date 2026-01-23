package com.helha.backend.domain.repositories;

import com.helha.backend.domain.models.DbNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface INoteRepository extends JpaRepository<DbNote, Long> {


    // Find active notes for a specific folder
    List<DbNote> findByFolderIdAndDeletedFalse(Long folderId);
    // Find active notes for a specific user
    List<DbNote> findByUserIdAndDeletedFalse(Long userId);
    // Find active notes not in any folder for a specific user
    List<DbNote> findByUserIdAndFolderIsNullAndDeletedFalse(Long userId);
    // Find deleted notes only (to display in the bin)
    List<DbNote> findByUserIdAndDeletedTrue(Long userId);
    //   Find deleted notes where the deletion date is before a specific date
    List<DbNote> findByDeletedTrueAndDeletedAtBefore(LocalDateTime thresholdDate);
}