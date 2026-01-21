package com.helha.backend.domain.repositories;

import com.helha.backend.domain.models.DbNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface INoteRepository extends JpaRepository<DbNote, Long> {


    List<DbNote> findByFolderIdAndDeletedFalse(Long folderId);
    List<DbNote> findByUserIdAndDeletedFalse(Long userId);
    List<DbNote> findByUserIdAndFolderIsNullAndDeletedFalse(Long userId);
    // Find deleted notes only (to display in the bin)
    List<DbNote> findByUserIdAndDeletedTrue(Long userId);
    //   Find deleted notes where the deletion date is before a specific date
    List<DbNote> findByDeletedTrueAndDeletedAtBefore(LocalDateTime thresholdDate);
}