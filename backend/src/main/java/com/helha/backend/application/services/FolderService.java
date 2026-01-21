package com.helha.backend.application.services;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.application.dto.FolderDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.models.DbUser;
import com.helha.backend.domain.repositories.IFolderRepository;
import com.helha.backend.domain.repositories.IUserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FolderService {

    private final IFolderRepository folderRepository;
    // added for the filtering
    private final IUserRepository userRepository;

    public FolderService(IFolderRepository folderRepository, IUserRepository userRepository) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
    }

    //we retrieve the user that is logged in to be sure he's getting only his folders
    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }

    @Transactional(readOnly = true)
    public List<FolderDto> getFolderTree() {
        DbUser user = getCurrentUser();

        //filtering by "perentIsNull" and by user id
        // Correction : On transforme l'Optional en Stream pour retourner une liste (1 ou 0 élément)
        return folderRepository.findByUserIdAndParentIsNull(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FolderDto createFolder(FolderCreationDto input) {
        DbUser user = getCurrentUser();

        DbFolder folder = new DbFolder();
        folder.setName(input.getName());
        //important to link the folder at the user
        folder.setUser(user);

        if (input.getParentId() != null) {
            DbFolder parent = folderRepository.findById(input.getParentId())
                    .orElseThrow(() -> new GenericNotFoundException(input.getParentId(), "Folder"));

            //Security check that the parent folder belongs to the user
            if (!parent.getUser().getId().equals(user.getId())) {
                throw new GenericNotFoundException(input.getParentId(), "Folder (Access Denied)");
            }
            folder.setParent(parent);
        }

        DbFolder savedFolder = folderRepository.save(folder);
        return convertToDto(savedFolder);
    }

    //to delete a folder
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

    // --- Mapping Helpers ---

    // Converts Folder entity to DTO (recursive tree structure)
    private FolderDto convertToDto(DbFolder entity) {
        FolderDto dto = new FolderDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());

        // Recursive mapping for sub-folders
        if (entity.getChildren() != null) {
            dto.setChildren(entity.getChildren().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList()));
        }

        // Map associated notes
        if (entity.getDbNotes() != null) {
            dto.setNotes(entity.getDbNotes().stream()
                    .map(this::convertNoteToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    // Converts Note entity to DTO
    private NoteDto convertNoteToDto(DbNote entity) {
        NoteDto dto = new NoteDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());

        // Audit dates
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Link folder ID only
        if (entity.getFolder() != null) {
            dto.setFolderId(entity.getFolder().getId());
        }
        return dto;
    }
}