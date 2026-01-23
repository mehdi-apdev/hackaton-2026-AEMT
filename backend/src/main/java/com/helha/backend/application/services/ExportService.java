package com.helha.backend.application.services;

import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.models.DbUser;
import com.helha.backend.domain.repositories.IFolderRepository;
import com.helha.backend.domain.repositories.INoteRepository;
import com.helha.backend.domain.repositories.IUserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Service for exporting user notes and folders as a ZIP file.
 */
@Service
public class ExportService {
    private final IFolderRepository folderRepository;
    private final IUserRepository userRepository;
    private final INoteRepository noteRepository;

    public ExportService(IFolderRepository folderRepository, IUserRepository userRepository, INoteRepository noteRepository) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
    }

    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }

    @Transactional(readOnly = true)
    public byte[] exportUserNotesToZip() throws IOException {
        DbUser user = getCurrentUser();

        // CORRECTION 1 : Utiliser la méthode "...AndDeletedFalse"
        List<DbFolder> rootFolders = folderRepository.findByUserIdAndParentIsNullAndDeletedFalse(user.getId());

        // AJOUT : Récupérer aussi les notes qui sont à la racine (sans dossier)
        List<DbNote> rootNotes = noteRepository.findByUserIdAndFolderIsNullAndDeletedFalse(user.getId());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            // 1. Exporter les dossiers racines (et leur contenu récursivement)
            for (DbFolder folder : rootFolders) {
                zipFolder(folder, "", zos);
            }

            // 2. Exporter les notes racines (à la base du ZIP)
            for (DbNote note : rootNotes) {
                // On vérifie (redondant avec la requête SQL mais plus sûr)
                if (note.isDeleted()) continue;

                String noteFileName = sanitizeFilename(note.getTitle()) + ".md";
                ZipEntry entry = new ZipEntry(noteFileName);
                zos.putNextEntry(entry);
                String content = note.getContent() != null ? note.getContent() : "";
                zos.write(content.getBytes(StandardCharsets.UTF_8));
                zos.closeEntry();
            }
        }

        return baos.toByteArray();
    }

    private void zipFolder(DbFolder folder, String parentPath, ZipOutputStream zos) throws IOException {
        // CORRECTION 2 : Si le dossier est supprimé (bug de synchro possible), on l'ignore
        if (folder.isDeleted()) return;

        String currentPath = parentPath + sanitizeFilename(folder.getName()) + "/";

        zos.putNextEntry(new ZipEntry(currentPath));
        zos.closeEntry();

        // Ajout des notes du dossier courant
        if (folder.getDbNotes() != null) {
            for (DbNote note : folder.getDbNotes()) {
                // CORRECTION 3 : Ne pas exporter les notes supprimées
                if (note.isDeleted()) continue;

                String noteFileName = currentPath + sanitizeFilename(note.getTitle()) + ".md";
                ZipEntry entry = new ZipEntry(noteFileName);
                zos.putNextEntry(entry);
                String content = note.getContent() != null ? note.getContent() : "";
                zos.write(content.getBytes(StandardCharsets.UTF_8));
                zos.closeEntry();
            }
        }

        // Récursivité sur les enfants
        if (folder.getChildren() != null) {
            for (DbFolder child : folder.getChildren()) {
                // CORRECTION 4 : Ne pas exporter les sous-dossiers supprimés
                if (child.isDeleted()) continue;

                zipFolder(child, currentPath, zos);
            }
        }
    }

    private String sanitizeFilename(String input) {
        if (input == null) return "SansTitre";
        return input.replaceAll("[^a-zA-Z0-9 \\-_\\.]", "_");
    }
}