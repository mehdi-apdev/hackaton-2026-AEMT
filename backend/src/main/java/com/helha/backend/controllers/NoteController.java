package com.helha.backend.controllers;

import com.helha.backend.application.dto.NoteCreationDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.application.dto.NoteUpdateDto;
import com.helha.backend.application.services.ExportService;
import com.helha.backend.application.services.NoteService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;
    private final ExportService exportService;

    // Constructor injection for required services
    public NoteController(NoteService noteService, ExportService exportService) {
        this.noteService = noteService;
        this.exportService = exportService;
    }

    // Retrieve a single note by its ID
    @GetMapping("/{id}")
    public NoteDto getOne(@PathVariable Long id) {
        return noteService.getNoteById(id);
    }

    // Create a new note
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public NoteDto create(@RequestBody NoteCreationDto input) {
        return noteService.createNote(input);
    }

    // Update an existing note
    @PutMapping("/{id}")
    public NoteDto update(@PathVariable Long id, @RequestBody NoteUpdateDto input) {
        return noteService.updateNote(id, input);
    }

    // Delete a note
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        noteService.deleteNote(id);
    }

    // Export user's notes to a ZIP archive
    // Final URL: /api/notes/export/zip
    @GetMapping("/export/zip")
    public ResponseEntity<byte[]> downloadZip() {
        try {
            byte[] zipData = exportService.exportUserNotesToZip();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"mes_notes_hantees.zip\"")
                    .contentType(MediaType.valueOf("application/zip"))
                    .body(zipData);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}