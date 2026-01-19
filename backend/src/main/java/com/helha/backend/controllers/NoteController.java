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
        note.setContent(creationDto.getContent()); // Initialement vide
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

    @PutMapping("/{id}")
    public NoteDto updateNote(@PathVariable Long id, @RequestBody NoteUpdateDto updateDto) {
        DbNote note = noteRepository.findById(id)
                .orElseThrow(() -> new GenericNotFoundException(id, "Note"));

        // 1. Mise à jour du titre uniquement s'il n'est pas vide (Sécurité)
        if (updateDto.getTitle() != null && !updateDto.getTitle().isBlank()) {
            note.setTitle(updateDto.getTitle());
        }

        // 2. Mise à jour du contenu (on accepte que ce soit vide)
        note.setContent(updateDto.getContent());

        // 3. --- PALIER ZOMBIE : Calcul des métadonnées en temps réel ---
        // On s'assure de ne pas envoyer "null" aux utilitaires pour éviter les crashs
        String content = (updateDto.getContent() != null) ? updateDto.getContent() : "";

        note.setWordCount(MetadataUtils.countWords(content));
        note.setLineCount(MetadataUtils.countLines(content));
        note.setCharacterCount(MetadataUtils.countCharacters(content));
        note.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content));

        // 4. Sauvegarde et conversion
        DbNote savedNote = noteRepository.save(note);
        return modelMapper.map(savedNote, NoteDto.class);
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