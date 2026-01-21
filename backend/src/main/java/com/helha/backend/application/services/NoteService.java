package com.helha.backend.application.services;

import com.helha.backend.application.dto.NoteCreationDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.application.dto.NoteUpdateDto;
import com.helha.backend.domain.service.MetadataUtils;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.models.DbUser;
import com.helha.backend.domain.repositories.IFolderRepository;
import com.helha.backend.domain.repositories.INoteRepository;
import com.helha.backend.domain.repositories.IUserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final INoteRepository noteRepository;
    private final IFolderRepository folderRepository;
    private final IUserRepository userRepository;

    public NoteService(INoteRepository noteRepository, IFolderRepository folderRepository,
                       IUserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
    }

    // Private helper to retrieve the user making the request
    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }

    // Retrieve a note by its ID with ownership verification
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

    // Create a note bound to the user and its folder (defaults to Root Folder if null)
    @Transactional
    public NoteDto createNote(NoteCreationDto input) {
        DbUser user = getCurrentUser();
        DbNote note = new DbNote();
        note.setTitle(input.getTitle());
        note.setContent(input.getContent());
        note.setUser(user);

        if (input.getFolderId() != null) {
            // Case 1: Specific folder ID provided
            DbFolder folder = folderRepository.findById(input.getFolderId())
                    .orElseThrow(() -> new GenericNotFoundException(input.getFolderId(), "Folder"));

            if (!folder.getUser().getId().equals(user.getId())) {
                throw new GenericNotFoundException(input.getFolderId(), "Folder");
            }
            note.setFolder(folder);
        } else {
            // Case 2: Folder ID is null, assign to the user's "Root Folder" (parent IS NULL)
            DbFolder rootFolder = folderRepository.findByUserIdAndParentIsNull(user.getId())
                    .orElseThrow(() -> new GenericNotFoundException(0L, "Root Folder not found"));

            note.setFolder(rootFolder);
        }

        // Initial stats
        note.setWordCount(0);
        note.setLineCount(0);
        note.setCharacterCount(0);
        note.setSizeInBytes(0L);

        DbNote savedNote = noteRepository.save(note);
        return convertToDto(savedNote);
    }

    // Update a note and recalculate metadata
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

            // Recalculate Metadata
            String content = input.getContent();
            note.setWordCount(MetadataUtils.countWords(content));
            note.setLineCount(MetadataUtils.countLines(content));
            note.setCharacterCount(MetadataUtils.countCharacters(content));
            note.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content));
        }

        DbNote updatedNote = noteRepository.save(note);
        return convertToDto(updatedNote);
    }

    // Delete a note with ownership verification
    @Transactional
    public void deleteNote(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        noteRepository.delete(note);
    }

    // --- Mapping Helpers ---
    private NoteDto convertToDto(DbNote entity) {
        NoteDto dto = new NoteDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());

        // Audit dates
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Technical Stats
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