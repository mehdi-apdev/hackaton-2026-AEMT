package com.helha.backend.application.services;

import com.helha.backend.application.dto.NoteCreationDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.application.dto.NoteUpdateDto;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.models.DbUser;
import com.helha.backend.domain.repositories.IFolderRepository;
import com.helha.backend.domain.repositories.INoteRepository;
import com.helha.backend.domain.repositories.IUserRepository;
import com.helha.backend.domain.service.MetadataUtils;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final INoteRepository noteRepository;
    private final IFolderRepository folderRepository;
    private final IUserRepository userRepository;
    private final ModelMapper modelMapper;

    public NoteService(INoteRepository noteRepository, IFolderRepository folderRepository,
                       IUserRepository userRepository, ModelMapper modelMapper) {
        this.noteRepository = noteRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    /**
     * Private helper to retrieve the user making the request from Security Context.
     */
    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }

    /**
     * Creates a new note.
     * If folderId is null, it finds OR creates a default root folder for the user.
     */
    /**
     * Creates a note. If folderId is null, it finds OR creates a root folder.
     * This ensures the application keeps working even if the user deleted their root folder.
     */
    @Transactional
    public NoteDto createNote(NoteCreationDto input) {
        DbUser user = getCurrentUser();
        DbNote note = new DbNote();
        note.setTitle(input.getTitle());
        note.setContent(input.getContent() != null ? input.getContent() : "");
        note.setUser(user);

        if (input.getFolderId() != null) {
            DbFolder folder = folderRepository.findById(input.getFolderId())
                    .orElseThrow(() -> new GenericNotFoundException(input.getFolderId(), "Folder"));
            note.setFolder(folder);
        } else {
            // Find an existing active root folder OR create a new one if missing
            DbFolder root = folderRepository.findByUserIdAndParentIsNullAndDeletedFalse(user.getId())
                    .stream()
                    .findFirst()
                    .orElseGet(() -> {
                        // Logic to recreate the root folder on the fly
                        DbFolder newRoot = new DbFolder();
                        newRoot.setName("Ma bibliothèque");
                        newRoot.setUser(user);
                        newRoot.setParent(null);
                        newRoot.setDeleted(false);
                        return folderRepository.save(newRoot);
                    });
            note.setFolder(root);
        }

        updateMetadata(note, note.getContent());
        return convertToDto(noteRepository.save(note));
    }

    /**
     * Retrieves a note by its ID with ownership verification.
     */
    @Transactional(readOnly = true)
    public NoteDto getNoteById(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        return convertToDto(note);
    }

    /**
     * Updates an existing note and refreshes its metadata.
     */
    @Transactional
    public NoteDto updateNote(Long id, NoteUpdateDto input) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        if (input.getTitle() != null && !input.getTitle().isBlank()) {
            note.setTitle(input.getTitle());
        }

        if (input.getContent() != null) {
            note.setContent(input.getContent());
            updateMetadata(note, input.getContent());
        }

        return convertToDto(noteRepository.save(note));
    }

    /**
     * Soft delete: Marks a note as deleted and sets the deletion timestamp.
     */
    @Transactional
    public void deleteNote(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        note.setDeleted(true);
        note.setDeletedAt(LocalDateTime.now());
        noteRepository.save(note);
    }

    /**
     * Restore: Unmarks a note as deleted and clears the timestamp.
     */
    @Transactional
    public void restoreNote(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        note.setDeleted(false);
        note.setDeletedAt(null);
        noteRepository.save(note);
    }

    /**
     * Permanent Delete from the database.
     */
    @Transactional
    public void hardDeleteNote(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        noteRepository.delete(note);
    }

    /**
     * Retrieves all active notes at the root (not in any sub-folder).
     */
    @Transactional(readOnly = true)
    public List<NoteDto> getRootNotes() {
        DbUser user = getCurrentUser();
        return noteRepository.findByUserIdAndFolderIsNullAndDeletedFalse(user.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Retrieves all notes currently in the recycle bin for the authenticated user.
     */
    @Transactional(readOnly = true)
    public List<NoteDto> getDeletedNotes() {
        return noteRepository.findByUserIdAndDeletedTrue(getCurrentUser().getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * Internal helper to update note statistics using MetadataUtils.
     */
    private void updateMetadata(DbNote note, String content) {
        if (content == null) content = "";
        note.setWordCount(MetadataUtils.countWords(content));
        note.setLineCount(MetadataUtils.countLines(content));
        note.setCharacterCount(MetadataUtils.countCharacters(content));
        note.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content));
    }

    /**
     * Converts a database entity to a DTO for the front-end.
     */
    private NoteDto convertToDto(DbNote entity) {
        NoteDto dto = new NoteDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
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