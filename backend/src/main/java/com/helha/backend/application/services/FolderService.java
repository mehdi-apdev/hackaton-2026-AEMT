package com.helha.backend.application.services;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.application.dto.FolderDto;
import com.helha.backend.application.dto.FolderUpdateDto;
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

    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }

    // --- Active Tree ---
    @Transactional(readOnly = true)
    public List<FolderDto> getFolderTree() {
        DbUser user = getCurrentUser();
        // Fetch only active roots
        List<DbFolder> roots = folderRepository.findByUserIdAndParentIsNullAndDeletedFalse(user.getId());
        return roots.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    @Transactional
    public FolderDto createFolder(FolderCreationDto input) {
        DbUser user = getCurrentUser();
        DbFolder folder = new DbFolder();
        folder.setName(input.getName());
        folder.setUser(user);

        if (input.getParentId() != null) {
            DbFolder parent = folderRepository.findById(input.getParentId())
                    .orElseThrow(() -> new GenericNotFoundException(input.getParentId(), "Folder"));
            if (!parent.getUser().getId().equals(user.getId())) throw new GenericNotFoundException(input.getParentId(), "Folder");
            folder.setParent(parent);
        }
        return convertToDto(folderRepository.save(folder));
    }

    // --- RECYCLE BIN LOGIC ---

    // 1. Soft Delete
    @Transactional
    public void deleteFolder(Long id) {
        DbUser user = getCurrentUser();
        DbFolder folder = folderRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Folder"));
        if (!folder.getUser().getId().equals(user.getId())) throw new GenericNotFoundException(id, "Folder");

        folder.setDeleted(true);
        folder.setDeletedAt(LocalDateTime.now()); // Set timestamp
        folderRepository.save(folder);
    }

    // 2. Get Deleted Folders
    @Transactional(readOnly = true)
    public List<FolderDto> getDeletedFolders() {
        return folderRepository.findByUserIdAndDeletedTrue(getCurrentUser().getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // 3. Restore Folder
    @Transactional
    public void restoreFolder(Long id) {
        DbUser user = getCurrentUser();
        DbFolder folder = folderRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Folder"));
        if (!folder.getUser().getId().equals(user.getId())) throw new GenericNotFoundException(id, "Folder");

        folder.setDeleted(false);
        folder.setDeletedAt(null); // Clear timestamp
        folderRepository.save(folder);
    }

    // 4. Hard Delete
    @Transactional
    public void hardDeleteFolder(Long id) {
        DbUser user = getCurrentUser();
        DbFolder folder = folderRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Folder"));
        if (!folder.getUser().getId().equals(user.getId())) throw new GenericNotFoundException(id, "Folder");

        folderRepository.delete(folder);
    }

    // --- Helpers ---
    private FolderDto convertToDto(DbFolder entity) {
        FolderDto dto = new FolderDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());

        if (entity.getChildren() != null) {
            dto.setChildren(entity.getChildren().stream()
                    .filter(child -> !child.isDeleted()) // Filter out deleted children
                    .map(this::convertToDto)
                    .collect(Collectors.toList()));
        }

        if (entity.getDbNotes() != null) {
            dto.setNotes(entity.getDbNotes().stream()
                    .filter(note -> !note.isDeleted()) // Filter out deleted notes
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
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        if (entity.getFolder() != null) dto.setFolderId(entity.getFolder().getId());
        return dto;
    }

    /**
     * Updates the name of an existing folder.
     * Works for both root folders and sub-folders.
     * @param id The ID of the folder to update.
     * @param input The DTO containing the new name.
     * @return The updated folder as a DTO.
     */
    @Transactional
    public FolderDto updateFolder(Long id, FolderUpdateDto input) {
        DbUser user = getCurrentUser(); // Get currently logged-in user

        // Find the folder or throw an exception if not found
        DbFolder folder = folderRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Folder"));

        // Security: Check if the folder belongs to the current user
        if (!folder.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Folder");
        }

        // Update the name if provided and not blank
        if (input.getName() != null && !input.getName().isBlank()) {
            folder.setName(input.getName());
        }

        DbFolder updatedFolder = folderRepository.save(folder);
        return convertToDto(updatedFolder); // Convert back to DTO for the front-end
    }
}