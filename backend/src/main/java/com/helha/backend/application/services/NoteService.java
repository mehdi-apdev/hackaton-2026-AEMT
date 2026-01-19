package com.helha.backend.application.services;

import com.helha.backend.application.dto.NoteCreationDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.application.dto.NoteUpdateDto;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.infrastructure.database.entities.DbFolder;
import com.helha.backend.infrastructure.database.entities.DbNote;
import com.helha.backend.infrastructure.database.repository.IFolderRepository;
import com.helha.backend.infrastructure.database.repository.INoteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class NoteService {

    private final INoteRepository noteRepository;
    private final IFolderRepository folderRepository;

    public NoteService(INoteRepository noteRepository, IFolderRepository folderRepository) {
        this.noteRepository = noteRepository;
        this.folderRepository = folderRepository;
    }

    // 1. Récupérer une note par son ID
    @Transactional(readOnly = true)
    public NoteDto getNoteById(Long id) {
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));
        return convertToDto(note);
    }

    // 2. Créer une note dans un dossier existant
    @Transactional
    public NoteDto createNote(NoteCreationDto input) {
        // On vérifie d'abord que le dossier parent existe
        DbFolder folder = folderRepository.findById(input.getFolderId())
                .orElseThrow(() -> new GenericNotFoundException(input.getFolderId(), "Folder"));

        DbNote note = new DbNote();
        note.setTitle(input.getTitle());
        note.setContent(""); // Contenu vide par défaut à la création
        note.setFolder(folder);

        DbNote savedNote = noteRepository.save(note);
        return convertToDto(savedNote);
    }

    // 3. Mettre à jour une note (Titre ou Contenu)
    @Transactional
    public NoteDto updateNote(Long id, NoteUpdateDto input) {
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (input.getTitle() != null) {
            note.setTitle(input.getTitle());
        }
        if (input.getContent() != null) {
            note.setContent(input.getContent());
        }

        DbNote updatedNote = noteRepository.save(note);
        return convertToDto(updatedNote);
    }

    // 4. Supprimer une note
    @Transactional
    public void deleteNote(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new GenericNotFoundException(id, "Note");
        }
        noteRepository.deleteById(id);
    }

    // --- Helper de conversion (Entity -> DTO) ---
    private NoteDto convertToDto(DbNote entity) {
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