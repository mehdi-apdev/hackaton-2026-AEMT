package com.helha.backend.application.services;

import com.helha.backend.application.dto.NoteCreationDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.application.dto.NoteUpdateDto;
import com.helha.backend.application.utils.MetadataUtils;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.infrastructure.database.entities.DbFolder;
import com.helha.backend.infrastructure.database.entities.DbNote;
import com.helha.backend.infrastructure.database.entities.DbUser;
import com.helha.backend.infrastructure.database.repository.IFolderRepository;
import com.helha.backend.infrastructure.database.repository.INoteRepository;
import com.helha.backend.infrastructure.database.repository.IUserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
     * Helper privé pour récupérer l'utilisateur qui fait la requête
     */
    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }

    // 1. Récupérer une note par son ID (avec vérification de propriété)
    @Transactional(readOnly = true)
    public NoteDto getNoteById(Long id) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        // Sécurité : Si ce n'est pas ma note, je ne la vois pas
        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        return modelMapper.map(note, NoteDto.class);
    }

    // 2. Créer une note (Liée à l'utilisateur et son dossier)
    @Transactional
    public NoteDto createNote(NoteCreationDto input) {
        DbUser user = getCurrentUser();

        DbFolder folder = folderRepository.findById(input.getFolderId())
                .orElseThrow(() -> new GenericNotFoundException(input.getFolderId(), "Folder"));

        // Sécurité : On ne peut pas créer une note dans le dossier de quelqu'un d'autre
        if (!folder.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(input.getFolderId(), "Folder");
        }

        DbNote note = new DbNote();
        note.setTitle(input.getTitle());
        note.setContent("");
        note.setFolder(folder);
        note.setUser(user); // on attribut a l'user

        // Init stats Zombie
        note.setWordCount(0);
        note.setLineCount(0);
        note.setCharacterCount(0);
        note.setSizeInBytes(0);

        DbNote savedNote = noteRepository.save(note);
        return modelMapper.map(savedNote, NoteDto.class);
    }

    // 3. Mettre à jour (Stats Zombie + Twist Seuil Maudit)
    @Transactional
    public NoteDto updateNote(Long id, NoteUpdateDto input) {
        DbUser user = getCurrentUser();
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        // Sécurité propriété
        if (!note.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(id, "Note");
        }

        if (input.getTitle() != null && !input.getTitle().isBlank()) {
            note.setTitle(input.getTitle());
        }

        if (input.getContent() != null) {
            note.setContent(input.getContent());

            // --- PALIER ZOMBIE : Métadonnées ---
            String content = input.getContent();
            int words = MetadataUtils.countWords(content);
            note.setWordCount(words);
            note.setLineCount(MetadataUtils.countLines(content));
            note.setCharacterCount(MetadataUtils.countCharacters(content));
            note.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content));

//            // --- TWIST : Seuil Maudit ---
//            if (words >= 666) {
//                note.setCurseLevel(3); // Apocalypse
//            }
        }

        DbNote updatedNote = noteRepository.save(note);
        return modelMapper.map(updatedNote, NoteDto.class);
    }

    // 4. Supprimer une note (Propriétaire uniquement)
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
}