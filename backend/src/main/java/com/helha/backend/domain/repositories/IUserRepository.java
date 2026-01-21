package com.helha.backend.domain.repositories;

import com.helha.backend.domain.models.DbUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface IUserRepository extends JpaRepository<DbUser, Long> {
    Optional<DbUser> findByUsername(String username);
}