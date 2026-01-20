package com.helha.backend.infrastructure.database.repository;

import com.helha.backend.infrastructure.database.entities.DbUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface IUserRepository extends JpaRepository<DbUser, Long> {
    Optional<DbUser> findByUsername(String username);
}