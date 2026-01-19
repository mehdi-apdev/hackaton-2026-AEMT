package com.helha.backend.application.services;

import com.helha.backend.application.dto.FolderCreationDto;
import com.helha.backend.application.dto.FolderDto;
import com.helha.backend.application.dto.NoteDto;
import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.infrastructure.database.entities.DbFolder;
import com.helha.backend.infrastructure.database.entities.DbNote;
import com.helha.backend.infrastructure.database.repository.IFolderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FolderService {

    private final IFolderRepository folderRepository;

    public FolderService(IFolderRepository folderRepository) {
        this.folderRepository = folderRepository;
    }

    @Transactional(readOnly = true)
    public List<FolderDto> getFolderTree() {
        // Récupère uniquement les racines
        List<DbFolder> roots = folderRepository.findByParentIsNull();
        return roots.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FolderDto createFolder(FolderCreationDto input) {
        DbFolder folder = new DbFolder();
        folder.setName(input.getName());

        // LOGIQUE CRITIQUE : Gestion du parent optionnel
        if (input.getParentId() != null) {
            DbFolder parent = folderRepository.findById(input.getParentId())
                    .orElseThrow(() -> new GenericNotFoundException(input.getParentId(), "Folder"));
            folder.setParent(parent);
        }
        // Si input.getParentId() est null, folder.setParent n'est pas appelé
        // Donc folder.parent reste null => C'est un dossier racine !

        DbFolder savedFolder = folderRepository.save(folder);
        return convertToDto(savedFolder);
    }

    @Transactional
    public void deleteFolder(Long id) {
        if (!folderRepository.existsById(id)) {
            throw new GenericNotFoundException(id, "Folder");
        }
        folderRepository.deleteById(id);
    }

    // --- Helpers de Mapping ---
    private FolderDto convertToDto(DbFolder entity) {
        FolderDto dto = new FolderDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());

        if (entity.getChildren() != null) {
            dto.setChildren(entity.getChildren().stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList()));
        }

        if (entity.getDbNotes() != null) {
            dto.setNotes(entity.getDbNotes().stream()
                    .map(this::convertNoteToDto)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private NoteDto convertNoteToDto(DbNote entity) {
        NoteDto dto = new NoteDto();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setContent(entity.getContent());
        if (entity.getFolder() != null) {
            dto.setFolderId(entity.getFolder().getId());
        }
        return dto;
    }
}