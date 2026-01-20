package com.helha.backend.application.services;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.application.dto.FolderDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.infrastructure.database.entities.DbFolder;
import com.helha.backend.infrastructure.database.entities.DbNote;
import com.helha.backend.infrastructure.database.entities.DbUser;
import com.helha.backend.infrastructure.database.repository.IFolderRepository;
import com.helha.backend.infrastructure.database.repository.IUserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FolderService {

    private final IFolderRepository folderRepository;
    private final IUserRepository userRepository; // Ajouté pour le filtrage

    public FolderService(IFolderRepository folderRepository, IUserRepository userRepository) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
    }

    /**
     * Helper pour récupérer l'utilisateur actuellement connecté
     */
    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }

    @Transactional(readOnly = true)
    public List<FolderDto> getFolderTree() {
        DbUser user = getCurrentUser();

        // On ne filtre plus seulement par parentIsNull, mais aussi par USER_ID !
        List<DbFolder> roots = folderRepository.findByUserIdAndParentIsNull(user.getId());

        return roots.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FolderDto createFolder(FolderCreationDto input) {
        DbUser user = getCurrentUser();

        DbFolder folder = new DbFolder();
        folder.setName(input.getName());
        folder.setUser(user); // CRUCIAL : On lie le dossier à l'utilisateur

        if (input.getParentId() != null) {
            DbFolder parent = folderRepository.findById(input.getParentId())
                    .orElseThrow(() -> new GenericNotFoundException(input.getParentId(), "Folder"));

            // Sécurité : Vérifier que le parent appartient bien à l'utilisateur
            if (!parent.getUser().getId().equals(user.getId())) {
                throw new GenericNotFoundException(input.getParentId(), "Folder (Access Denied)");
            }
            folder.setParent(parent);
        }

        DbFolder savedFolder = folderRepository.save(folder);
        return convertToDto(savedFolder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        DbUser user = getCurrentUser();
        DbFolder folder = folderRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Folder"));

        // Sécurité : On ne peut supprimer que ses propres dossiers
        if (!folder.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Folder (Access Denied)");
        }

        folderRepository.delete(folder);
    }

    // --- Helpers de Mapping ---
    private FolderDto convertToDto(DbFolder entity) {
        FolderDto dto = new FolderDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        // dto.setUserId(entity.getUser().getId()); // Optionnel si tu as le champ dans le DTO

        if (entity.getChildren() != null) {
            dto.setChildren(entity.getChildren().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList()));
        }

        if (entity.getDbNotes() != null) {
            dto.setNotes(entity.getDbNotes().stream()
                    .map(this::convertNoteToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private NoteDto convertNoteToDto(DbNote entity) {
        NoteDto dto = new NoteDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        if (entity.getFolder() != null) {
            dto.setFolderId(entity.getFolder().getId());
        }
        return dto;
    }
}