package com.helha.backend.controllers;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.application.dto.FolderDto;
import com.helha.backend.application.services.FolderService;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.domain.repositories.IFolderRepository; // Import manquant
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/folders")
public class FolderController {

    private final FolderService folderService;
    private final IFolderRepository folderRepository;


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
        //check if the parent folder exists if it is provided
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