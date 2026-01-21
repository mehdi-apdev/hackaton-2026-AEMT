package com.helha.backend.application.services;

import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.infrastructure.database.entities.DbFolder;
import com.helha.backend.infrastructure.database.entities.DbNote;
import com.helha.backend.infrastructure.database.entities.DbUser;
import com.helha.backend.infrastructure.database.repository.IFolderRepository;
import com.helha.backend.infrastructure.database.repository.IUserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;
@Service
public class ExportService {
    private final IFolderRepository folderRepository;
    private final IUserRepository userRepository;

    public ExportService(IFolderRepository folderRepository, IUserRepository userRepository) {
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
    }

    /**
     * Récupère l'utilisateur connecté (logique partagée)
     */
    private DbUser getCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new GenericNotFoundException(0L, "User " + username));
    }

    /**
     * Point d'entrée principal pour générer le ZIP
     */
    @Transactional(readOnly = true) // Important pour le Lazy Loading des enfants/notes
    public byte[] exportUserNotesToZip() throws IOException {
        DbUser user = getCurrentUser();

        // On récupère uniquement les racines (les dossiers sans parents)
        List<DbFolder> rootFolders = folderRepository.findByUserIdAndParentIsNull(user.getId());

        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (DbFolder folder : rootFolders) {
                // On lance la récursivité
                zipFolder(folder, "", zos);
            }
        }

        return baos.toByteArray();
    }

    /**
     * Méthode récursive pour parcourir l'arbre
     */
    private void zipFolder(DbFolder folder, String parentPath, ZipOutputStream zos) throws IOException {
        // 1. Construire le chemin du dossier courant
        // Exemple : "Horreur/Zombies/"
        String currentPath = parentPath + sanitizeFilename(folder.getName()) + "/";

        // Ajout d'une entrée pour le dossier lui-même (facultatif mais propre)
        zos.putNextEntry(new ZipEntry(currentPath));
        zos.closeEntry();

        // 2. Ajouter les notes du dossier courant
        if (folder.getDbNotes() != null) {
            for (DbNote note : folder.getDbNotes()) {
                // Création du fichier .md
                // Exemple : "Horreur/Zombies/MaNote.md"
                String noteFileName = currentPath + sanitizeFilename(note.getTitle()) + ".md";
                ZipEntry entry = new ZipEntry(noteFileName);

                zos.putNextEntry(entry);

                // Écriture du contenu
                String content = note.getContent() != null ? note.getContent() : "";
                zos.write(content.getBytes(StandardCharsets.UTF_8));

                zos.closeEntry();
            }
        }

        // 3. Récursivité sur les enfants
        if (folder.getChildren() != null) {
            for (DbFolder child : folder.getChildren()) {
                zipFolder(child, currentPath, zos);
            }
        }
    }

    /**
     * Nettoie les noms de fichiers pour éviter les caractères interdits dans les chemins ZIP
     */
    private String sanitizeFilename(String input) {
        if (input == null) return "SansTitre";
        // Remplace tout ce qui n'est pas alphanumérique, espace, tiret ou underscore par un underscore
        return input.replaceAll("[^a-zA-Z0-9 \\-_\\.]", "_");
    }
}

