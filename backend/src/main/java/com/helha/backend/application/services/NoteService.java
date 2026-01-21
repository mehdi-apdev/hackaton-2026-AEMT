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


    //Private helper to retrieve the user making the request
    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
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

        return modelMapper.map(note, NoteDto.class);
    }


    //Create a note bind to the user and it's folder
    @Transactional
    public NoteDto createNote(NoteCreationDto input) {
        DbUser user = getCurrentUser();

        DbFolder folder = folderRepository.findById(input.getFolderId())
                .orElseThrow(() -> new GenericNotFoundException(input.getFolderId(), "Folder"));

        // Security we cannot create a note in someone else's folder
        if (!folder.getUser().getId().equals(user.getId())) {
            throw new GenericNotFoundException(input.getFolderId(), "Folder");
        }

        DbNote note = new DbNote();
        note.setTitle(input.getTitle());
        note.setContent("");
        note.setFolder(folder);
        //we attribute to the user
        note.setUser(user);

        // Init Metadata stats
        note.setWordCount(0);
        note.setLineCount(0);
        note.setCharacterCount(0);
        note.setSizeInBytes(0);

        DbNote savedNote = noteRepository.save(note);
        return modelMapper.map(savedNote, NoteDto.class);
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
        return modelMapper.map(updatedNote, NoteDto.class);
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
}