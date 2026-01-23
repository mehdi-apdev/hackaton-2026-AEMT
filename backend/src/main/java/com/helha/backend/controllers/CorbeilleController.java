package com.helha.backend.controllers;

import com.helha.backend.application.dto.FolderDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.application.services.FolderService;
import com.helha.backend.application.services.NoteService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing the recycle bin (corbeille) functionality.
 * Allows users to view, restore, and permanently delete notes and folders from the recycle bin.
 */
@RestController
@RequestMapping("/api/corbeille")
public class CorbeilleController {

    private final NoteService noteService;
    private final FolderService folderService;

    public CorbeilleController(NoteService noteService, FolderService folderService) {
        this.noteService = noteService;
        this.folderService = folderService;
    }

    // --- NOTES ---

    // GET /api/corbeille (or /api/corbeille/notes if you prefer to separate)
    @GetMapping
    public List<NoteDto> getBinNotes() {
        return noteService.getDeletedNotes();
    }

    @PostMapping("/notes/{id}/restore")
    @ResponseStatus(HttpStatus.OK)
    public void restoreNote(@PathVariable Long id) {
        noteService.restoreNote(id);
    }

    @DeleteMapping("/notes/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void permanentDeleteNote(@PathVariable Long id) {
        noteService.hardDeleteNote(id);
    }

    // --- FOLDERS ---

    // 1. See deleted folders
    // GET /api/corbeille/folders
    @GetMapping("/folders")
    public List<FolderDto> getBinFolders() {
        return folderService.getDeletedFolders();
    }

    // 2. Restore a folder
    // POST /api/corbeille/folders/{id}/restore
    @PostMapping("/folders/{id}/restore")
    @ResponseStatus(HttpStatus.OK)
    public void restoreFolder(@PathVariable Long id) {
        folderService.restoreFolder(id);
    }

    // 3. Permanently delete a folder
    // DELETE /api/corbeille/folders/{id}
    @DeleteMapping("/folders/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void permanentDeleteFolder(@PathVariable Long id) {
        folderService.hardDeleteFolder(id);
    }
}