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

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FolderService {

    private final IFolderRepository folderRepository;
    private final IUserRepository userRepository;

    public FolderService(IFolderRepository folderRepository, IUserRepository userRepository) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
    }

    // Helper to retrieve the current authenticated user
    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }

    // Security check to ensure the folder belongs to the user
    private void checkFolderOwnership(DbFolder folder, DbUser user) {
        if (folder.getUser() == null || !folder.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(folder.getId(), "Folder");
        }
    }

    // --- Arborescence ---
    @Transactional(readOnly = true)
    public List<FolderDto> getFolderTree() {
        DbUser user = getCurrentUser();
        // On retourne l'unique racine active sous forme de liste
        return folderRepository.findByUserIdAndParentIsNullAndDeletedFalse(user.getId())
                .stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FolderDto createFolder(FolderCreationDto input) {
        DbUser user = getCurrentUser();

        if (input.getParentId() != null && input.getParentId() <= 0) {
            input.setParentId(null); // On force à null si c'est 0 ou négatif
        }

        // RÈGLE : Un seul dossier racine actif par utilisateur
        if (input.getParentId() == null) {
            if (folderRepository.existsByUserIdAndParentIsNullAndDeletedFalse(user.getId())) {
                throw new RuntimeException("Dossier racine déjà existant. Supprimez l'actuel avant d'en créer un nouveau.");
            }
        }

        DbFolder folder = new DbFolder();
        folder.setName(input.getName());
        folder.setUser(user);

        if (input.getParentId() != null) {
            DbFolder parent = folderRepository.findById(input.getParentId())
                    .orElseThrow(() -> new GenericNotFoundException(input.getParentId(), "Folder"));

            // Check ownership of the parent folder
            if (!parent.getUser().getId().equals(user.getId())) {
                throw new GenericNotFoundException(input.getParentId(), "Folder");
            }
            folder.setParent(parent);
        }
        return convertToDto(folderRepository.save(folder));
    }

    // --- Update ---
    @Transactional
    public FolderDto updateFolder(Long id, FolderCreationDto input) {
        DbUser user = getCurrentUser();
        DbFolder folder = folderRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Folder"));

        checkFolderOwnership(folder, user);

        // Rename logic
        if (input.getName() != null && !input.getName().isBlank()) {
            folder.setName(input.getName());
        }

        // Move folder logic (change parent)
        if (input.getParentId() != null) {
            if (input.getParentId().equals(id)) {
                throw new RuntimeException("Un dossier ne peut pas être son propre parent");
            }
            DbFolder newParent = folderRepository.findById(input.getParentId())
                    .orElseThrow(() -> new GenericNotFoundException(input.getParentId(), "Parent Folder"));

            if (!newParent.getUser().getId().equals(user.getId())) {
                throw new GenericNotFoundException(input.getParentId(), "Parent Folder");
            }
            folder.setParent(newParent);
        }

        return convertToDto(folderRepository.save(folder));
    }

    // --- Delete (Soft Delete) ---
    @Transactional
    public void deleteFolder(Long id) {
        DbUser user = getCurrentUser();
        DbFolder folder = folderRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Folder"));

        checkFolderOwnership(folder, user);

        folder.setDeleted(true);
        folder.setDeletedAt(LocalDateTime.now());
        folderRepository.save(folder);
    }

    // --- Hard Delete (Permanent) ---
    @Transactional
    public void hardDeleteFolder(Long id) {
        DbUser user = getCurrentUser();
        DbFolder folder = folderRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Folder"));

        checkFolderOwnership(folder, user);

        // Cascade ALL (defined in DbFolder) will handle children and notes
        folderRepository.delete(folder);
    }

    // --- Recycle Bin Logic ---
    @Transactional(readOnly = true)
    public List<FolderDto> getDeletedFolders() {
        return folderRepository.findByUserIdAndDeletedTrue(getCurrentUser().getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void restoreFolder(Long id) {
        DbUser user = getCurrentUser();
        DbFolder folder = folderRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Folder"));

        checkFolderOwnership(folder, user);

        // Si on restaure une racine, on vérifie qu'il n'y en a pas déjà une autre active
        if (folder.getParent() == null && folderRepository.existsByUserIdAndParentIsNullAndDeletedFalse(user.getId())) {
            throw new RuntimeException("Impossible de restaurer : une racine active existe déjà.");
        }

        folder.setDeleted(false);
        folder.setDeletedAt(null);
        folderRepository.save(folder);
    }

    // --- Helpers ---

    // Converts Folder entity to DTO (recursive tree structure)
    private FolderDto convertToDto(DbFolder entity) {
        FolderDto dto = new FolderDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());

        // Recursive mapping for sub-folders (filtering out deleted ones)
        if (entity.getChildren() != null) {
            dto.setChildren(entity.getChildren().stream()
                    .filter(child -> !child.isDeleted())
                    .map(this::convertToDto)
                    .collect(Collectors.toList()));
        }

        // Map associated notes (filtering out deleted ones)
        if (entity.getDbNotes() != null) {
            dto.setNotes(entity.getDbNotes().stream()
                    .filter(note -> !note.isDeleted())
                    .map(this::convertNoteToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    // Converts Note entity to DTO with full metadata
    private NoteDto convertNoteToDto(DbNote entity) {
        NoteDto dto = new NoteDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());

        // Audit and technical stats
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setWordCount(entity.getWordCount());
        dto.setLineCount(entity.getLineCount());
        dto.setCharacterCount(entity.getCharacterCount());
        dto.setSizeInBytes(entity.getSizeInBytes());

        if (entity.getFolder() != null) {
            dto.setFolderId(entity.getFolder().getId());
        }
        return dto;
    }
}