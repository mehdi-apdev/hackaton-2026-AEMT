package com.helha.backend.controllers;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.application.dto.FolderDto;
import com.helha.backend.application.dto.FolderUpdateDto;
import com.helha.backend.application.services.FolderService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    // Voir l'arbre des dossiers et notes
    @GetMapping("/tree")
    public List<FolderDto> getTree() {
        return folderService.getFolderTree();
    }

    // Créer un dossier
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FolderDto create(@RequestBody FolderCreationDto input) {
        return folderService.createFolder(input);
    }

    // Mettre à jour (Renommer ou Déplacer)
    @PutMapping("/{id}")
    public FolderDto update(@PathVariable Long id, @RequestBody FolderCreationDto input) {
        return folderService.updateFolder(id, input);
    }

    // Supprimer définitivement
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        folderService.deleteFolder(id);
    }
}