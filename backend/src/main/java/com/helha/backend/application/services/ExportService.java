package com.helha.backend.application.services;

import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import com.helha.backend.infrastructure.database.entities.DbFolder;
import com.helha.backend.infrastructure.database.entities.DbNote;
import com.helha.backend.infrastructure.database.entities.DbUser;
import com.helha.backend.infrastructure.database.repository.IFolderRepository;
import com.helha.backend.infrastructure.database.repository.INoteRepository;
import com.helha.backend.infrastructure.database.repository.IUserRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

//manage the zip export
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


     //Clean files name to prevent forbiden characters in the zip path
    private String sanitizeFilename(String input) {
        if (input == null) return "SansTitre";
        // Replace everything that is not alphanumeric , spaces , dash by a underscore
        return input.replaceAll("[^a-zA-Z0-9 \\-_\\.]", "_");
    }




    /*export PDF
    public byte[] exportAllNotesToPdf() {
        DbUser user = getCurrentUser();

        List<DbNote> notes = noteRepository.findByUserId(user.getId());
        //permet de creer un tuyau en memoire vive le pdf est construit dans la RAM avec un try pour etre sur que le tuyau soit fermer a la fin
        // baos = ByteArrayOutputStream
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            // 1. Créer le document PDF
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, baos);

            // 2. Ouvrir le document pour écrire dedans
            document.open();

            // 3. Ajouter un titre principal
            Font fontTitrePrincipal = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20);
            Paragraph titreExport = new Paragraph("Mes Notes Spooky - Export", fontTitrePrincipal);
            titreExport.setAlignment(Element.ALIGN_CENTER);
            titreExport.setSpacingAfter(20);
            document.add(titreExport);

            // 4. Boucler sur les notes
            Font fontTitreNote = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14);
            Font fontContenu = FontFactory.getFont(FontFactory.HELVETICA, 12);

            for (DbNote note : notes) {
                // Titre de la note
                Paragraph pTitre = new Paragraph(note.getTitle(), fontTitreNote);
                pTitre.setSpacingBefore(10);
                document.add(pTitre);

                // Contenu de la note
                Paragraph pContenu = new Paragraph(note.getContent(), fontContenu);
                pContenu.setSpacingAfter(10);
                document.add(pContenu);

                // Une petite ligne de séparation
                document.add(new Paragraph("--------------------------------------------------"));
            }

            // 5. Fermer le document
            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }
    }
    */

}

