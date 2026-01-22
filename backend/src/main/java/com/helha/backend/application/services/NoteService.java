package com.helha.backend.application.services;

import com.helha.backend.application.dto.*;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.domain.models.*;
import com.helha.backend.domain.repositories.*;
import com.helha.backend.domain.service.MetadataUtils;
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

    public NoteService(INoteRepository noteRepository, IFolderRepository folderRepository, IUserRepository userRepository) {
        this.noteRepository = noteRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
    }

    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new GenericNotFoundException(0L, "User"));
    }

    private void checkOwnership(DbNote note, DbUser user) {
        // Sécurité contre l'erreur 500 : on vérifie si getUser() est null
        if (note.getUser() == null || !note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(note.getId(), "Note");
        }
    }

    // Récupérer une note par ID (utile pour NoteController)
    @Transactional(readOnly = true)
    public NoteDto getNoteById(Long id) {
        DbNote note = noteRepository.findById(id).orElseThrow(() -> new GenericNotFoundException(id, "Note"));
        checkOwnership(note, getCurrentUser());
        return convertToDto(note);
    }

    @Transactional
    public NoteDto createNote(NoteCreationDto input) {
        DbUser user = getCurrentUser();
        DbNote note = new DbNote();
        note.setTitle(input.getTitle());
        note.setContent(input.getContent() != null ? input.getContent() : "");
        note.setUser(user);

        if (input.getFolderId() != null) {
            DbFolder folder = folderRepository.findById(input.getFolderId()).orElseThrow(() -> new GenericNotFoundException(input.getFolderId(), "Folder"));
            if (!folder.getUser().getId().equals(user.getId())) throw new GenericNotFoundException(0L, "Folder");
            note.setFolder(folder);
        } else {
            // RÈGLE : Si pas de folderId, on cherche l'unique racine active
            DbFolder root = folderRepository.findByUserIdAndParentIsNullAndDeletedFalse(user.getId())
                    .orElseThrow(() -> new RuntimeException("Dossier racine introuvable. Créez-en un d'abord."));
            note.setFolder(root);
        }

        // Calcul des métadonnées initiales
        updateMetadata(note, note.getContent());
        return convertToDto(noteRepository.save(note));
    }

    @Transactional
    public NoteDto updateNote(Long id, NoteUpdateDto input) {
        DbNote note = noteRepository.findById(id).orElseThrow(() -> new GenericNotFoundException(id, "Note"));
        checkOwnership(note, getCurrentUser());

        if (input.getTitle() != null) note.setTitle(input.getTitle());
        if (input.getContent() != null) {
            note.setContent(input.getContent());
            updateMetadata(note, input.getContent());
        }
        return convertToDto(noteRepository.save(note));
    }

    private void updateMetadata(DbNote note, String content) {
        note.setWordCount(MetadataUtils.countWords(content));
        note.setLineCount(MetadataUtils.countLines(content));
        note.setCharacterCount(MetadataUtils.countCharacters(content));
        note.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content));
    }

    // Soft Delete (Corbeille)
    @Transactional
    public void deleteNote(Long id) {
        DbNote note = noteRepository.findById(id).orElseThrow(() -> new GenericNotFoundException(id, "Note"));
        checkOwnership(note, getCurrentUser());
        note.setDeleted(true);
        note.setDeletedAt(LocalDateTime.now());
        noteRepository.save(note);
    }

    // RESTAURER UNE NOTE (C'est ce qui manquait pour ton CorbeilleController)
    @Transactional
    public void restoreNote(Long id) {
        DbNote note = noteRepository.findById(id).orElseThrow(() -> new GenericNotFoundException(id, "Note"));
        checkOwnership(note, getCurrentUser());
        note.setDeleted(false);
        note.setDeletedAt(null);
        noteRepository.save(note);
    }

    // Suppression définitive
    @Transactional
    public void hardDeleteNote(Long id) {
        DbNote note = noteRepository.findById(id).orElseThrow(() -> new GenericNotFoundException(id, "Note"));
        checkOwnership(note, getCurrentUser());
        noteRepository.delete(note);
    }

    @Transactional(readOnly = true)
    public List<NoteDto> getDeletedNotes() {
        return noteRepository.findByUserIdAndDeletedTrue(getCurrentUser().getId())
                .stream().map(this::convertToDto).collect(Collectors.toList());
    }

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
        if (entity.getFolder() != null) dto.setFolderId(entity.getFolder().getId());
        return dto;
    }
}