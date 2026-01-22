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


    //Private helper to retrieve the user making the request
    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }
    private void updateMetadata(DbNote note, String content) {
        if (content == null) {
            content = "";
        }
        // Utilise les méthodes statiques de MetadataUtils pour calculer les stats
        note.setWordCount(MetadataUtils.countWords(content));
        note.setLineCount(MetadataUtils.countLines(content));
        note.setCharacterCount(MetadataUtils.countCharacters(content));
        note.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content));
    }

    // retrieve a a note by it's ID with ownership verification
    @Transactional(readOnly = true)
    public NoteDto getNoteById(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        // Security if it's not my note I'm not able to see it
        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        return convertToDto(note);
    }



    // update a note
    @Transactional
    public NoteDto updateNote(Long id, NoteUpdateDto input) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        // Security to check ownership
        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        if (input.getTitle() != null && !input.getTitle().isBlank()) {
            note.setTitle(input.getTitle());
        }

        if (input.getContent() != null) {
            note.setContent(input.getContent());

            //Métadata
            String content = input.getContent();
            int words = MetadataUtils.countWords(content);
            note.setWordCount(words);
            note.setLineCount(MetadataUtils.countLines(content));
            note.setCharacterCount(MetadataUtils.countCharacters(content));
            note.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content));
        }

        DbNote updatedNote = noteRepository.save(note);
        return convertToDto(updatedNote);
    }

//    // Delete a note with ownership verification
//    @Transactional
//    public void deleteNote(Long id) {
//        DbUser user = getCurrentUser();
//        DbNote note = noteRepository.findById(id)
//                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));
//
//        if (!note.getUser().getId().equals(user.getId())) {
//            throw new GenericNotFoundException(id, "Note");
//        }
//
//        noteRepository.delete(note);
//    }
//
//    // Method to get notes that are at the root (not in any folder)
//    @Transactional(readOnly = true)
//    public List<NoteDto> getRootNotes() {
//        DbUser user = getCurrentUser();
//        return noteRepository.findByUserIdAndFolderIsNull(user.getId()).stream()
//                .map(this::convertToDto)
//                .collect(Collectors.toList());
//    }

    // --- Mapping Helpers ---
    private NoteDto convertToDto(DbNote entity) {
        NoteDto dto = new NoteDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());

        // Audit dates for the front-end
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Zombie Palier Stats
        dto.setWordCount(entity.getWordCount());
        dto.setLineCount(entity.getLineCount());
        dto.setCharacterCount(entity.getCharacterCount());
        dto.setSizeInBytes(entity.getSizeInBytes());

        if (entity.getFolder() != null) {
            dto.setFolderId(entity.getFolder().getId());
        }
        return dto;
    }
    // 1. Soft delete: Mark as deleted and set the timestamp
    @Transactional
    public void deleteNote(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        note.setDeleted(true);
        note.setDeletedAt(LocalDateTime.now()); // <--- Set timestamp
        noteRepository.save(note);
    }

    // 2. Restore: Unmark as deleted and clear the timestamp
    @Transactional
    public void restoreNote(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (!note.getUser().getId().equals(user.getId())) throw new GenericNotFoundException(id, "Note");

        note.setDeleted(false);
        note.setDeletedAt(null); // <--- Clear timestamp
        noteRepository.save(note);
    }

    // 3. NEW: Permanent Delete
    @Transactional
    public void hardDeleteNote(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        if (!note.getUser().getId().equals(user.getId())) throw new GenericNotFoundException(id, "Note");

        noteRepository.delete(note); // Actual DB deletion
    }

    // 4. Update getRootNotes
    @Transactional(readOnly = true)
    public List<NoteDto> getRootNotes() {
        DbUser user = getCurrentUser();
        // Use the new repository method
        return noteRepository.findByUserIdAndFolderIsNullAndDeletedFalse(user.getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // 5. NEW: Get all notes in the bin
    @Transactional(readOnly = true)
    public List<NoteDto> getDeletedNotes() {
        return noteRepository.findByUserIdAndDeletedTrue(getCurrentUser().getId()).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    @Transactional
    public NoteDto createNote(NoteCreationDto input) {
        DbUser user = getCurrentUser(); // Récupère l'utilisateur connecté
        DbNote note = new DbNote();
        note.setTitle(input.getTitle());
        note.setContent(input.getContent() != null ? input.getContent() : "");
        note.setUser(user);

        if (input.getFolderId() != null) {
            // Cas où un dossier spécifique est demandé
            DbFolder folder = folderRepository.findById(input.getFolderId())
                    .orElseThrow(() -> new GenericNotFoundException(input.getFolderId(), "Folder"));
            note.setFolder(folder);
        } else {
            // RÈGLE : Si pas de folderId, on cherche ou on crée le dossier racine actif
            DbFolder root = folderRepository.findByUserIdAndParentIsNullAndDeletedFalse(user.getId())
                    .stream()
                    .findFirst()
                    .orElseGet(() -> {
                        // Création automatique si aucun dossier racine n'existe
                        DbFolder newRoot = new DbFolder();
                        newRoot.setName("Ma Bibliothèque");
                        newRoot.setUser(user);
                        return folderRepository.save(newRoot);
                    });
            note.setFolder(root);
        }

        updateMetadata(note, note.getContent()); // Met à jour les stats (mots, lignes, etc.)
        return convertToDto(noteRepository.save(note));
    }
}