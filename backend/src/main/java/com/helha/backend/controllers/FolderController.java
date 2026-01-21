package com.helha.backend.controllers;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.application.dto.FolderDto;
import com.helha.backend.application.services.FolderService;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.infrastructure.database.repository.IFolderRepository; // Import manquant
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;
    private final IFolderRepository folderRepository; // 1. Déclaration du repository

    // 2. Mise à jour du constructeur pour injecter les deux
    public FolderController(FolderService folderService, IFolderRepository folderRepository) {
        this.folderService = folderService;
        this.folderRepository = folderRepository;
    }

    // GET /api/folders/tree
    @GetMapping("/tree")
    public List<FolderDto> getTree() {
        return folderService.getFolderTree();
    }

    // POST /api/folders
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FolderDto create(@RequestBody FolderCreationDto input) {
        // Optionnel mais recommandé : vérifier si le dossier parent existe s'il est fourni
        if (input.getParentId() != null && !folderRepository.existsById(input.getParentId())) {
            throw new GenericNotFoundException(input.getParentId(), "Parent Folder");
        }
        return folderService.createFolder(input);
    }

    // DELETE /api/folders/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        // 3. La vérification que tu voulais ajouter
        if (!folderRepository.existsById(id)) {
            throw new GenericNotFoundException(id, "Folder");
        }
        folderService.deleteFolder(id);
    }
}