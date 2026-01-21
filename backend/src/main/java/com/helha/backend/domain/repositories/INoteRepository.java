package com.helha.backend.domain.repositories;

import com.helha.backend.domain.models.DbNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface INoteRepository extends JpaRepository<DbNote, Long> {
    //find all the notes in a specific folder
    List<DbNote> findByFolderId(Long folderId);
    List<DbNote> findByUserId(Long userId);

}