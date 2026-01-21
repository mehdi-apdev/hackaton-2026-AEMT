package com.helha.backend.domain.repositories;

import com.helha.backend.domain.models.DbFolder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // Ne pas oublier cet import

@Repository
public interface IFolderRepository extends JpaRepository<DbFolder, Long> {

    List<DbFolder> findByUserId(Long userId);

    Optional<DbFolder> findByUserIdAndParentIsNull(Long userId);
}