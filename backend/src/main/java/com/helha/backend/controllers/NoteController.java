package com.helha.backend.controllers;

import com.helha.backend.application.dto.NoteCreationDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.application.dto.NoteUpdateDto;
import com.helha.backend.application.utils.MetadataUtils;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.infrastructure.database.entities.DbFolder;
import com.helha.backend.infrastructure.database.entities.DbNote;
import com.helha.backend.infrastructure.database.repository.IFolderRepository;
import com.helha.backend.infrastructure.database.repository.INoteRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    @Autowired
    private INoteRepository noteRepository;

    @Autowired
    private IFolderRepository folderRepository;

    @Autowired
    private ModelMapper modelMapper;

    // 1. Créer une note (POST)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteDto createNote(@RequestBody NoteCreationDto creationDto) {
        // On cherche le dossier obligatoire via l'ID fourni dans le DTO
        DbFolder folder = folderRepository.findById(creationDto.getFolderId())
                .orElseThrow(() -> new GenericNotFoundException(creationDto.getFolderId(), "Folder"));

        DbNote note = new DbNote();
        note.setTitle(creationDto.getTitle());
        note.setContent(""); // Initialement vide
        note.setFolder(folder);

        // On initialise les stats à 0
        note.setWordCount(0);
        note.setLineCount(0);
        note.setCharacterCount(0);
        note.setSizeInBytes(0);

        return modelMapper.map(noteRepository.save(note), NoteDto.class);
    }

    // 2. Charger une note (GET)
    @GetMapping("/{id}")
    public NoteDto getNote(@PathVariable Long id) {
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        return modelMapper.map(note, NoteDto.class);
    }

    // 3. Sauvegarder / Mettre à jour (PUT)
    @PutMapping("/{id}")
    public NoteDto updateNote(@PathVariable Long id, @RequestBody NoteUpdateDto updateDto) {
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        note.setTitle(updateDto.getTitle());
        note.setContent(updateDto.getContent());

        // --- PALIER ZOMBIE : Calcul des métadonnées en temps réel ---
        String content = updateDto.getContent();
        note.setWordCount(MetadataUtils.countWords(content));
        note.setLineCount(MetadataUtils.countLines(content));
        note.setCharacterCount(MetadataUtils.countCharacters(content));
        note.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content));

        return modelMapper.map(noteRepository.save(note), NoteDto.class);
    }

    // 4. Supprimer une note (DELETE)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteNote(@PathVariable Long id) {
        if (!noteRepository.existsById(id)) {
            throw new GenericNotFoundException(id, "Note");
        }
        noteRepository.deleteById(id);
    }
}