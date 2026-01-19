package com.helha.backend.infrastructure.seeding;


import com.helha.backend.application.utils.MetadataUtils;
import com.helha.backend.infrastructure.database.entities.Folder;
import com.helha.backend.infrastructure.database.entities.Note;
import com.helha.backend.infrastructure.database.repository.FolderRepository;
import com.helha.backend.infrastructure.database.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component // Indique à Spring de lancer cette classe au démarrage
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private FolderRepository folderRepository;

    @Autowired
    private NoteRepository noteRepository;

    @Override
    public void run(String... args) throws Exception {
        // On ne remplit que si la base est vide
        if (folderRepository.count() == 0) {
            System.out.println("🎃 Initialisation des données Spooky...");

            // 1. Créer un dossier racine
            Folder root = new Folder();
            root.setName("Ma Bibliothèque Hantée");
            root = folderRepository.save(root);

            // 2. Créer un sous-dossier (pour tester la récursivité demandée)
            Folder horror = new Folder();
            horror.setName("Histoires de Zombies");
            horror.setParent(root);
            horror = folderRepository.save(horror);

            // 3. Créer une note dans ce dossier
            Note note = new Note();
            note.setTitle("L'invasion du 31 octobre");
            note.setContent("# Alerte Zombie\nIls sont partout dans l'école !");
            note.setFolder(horror);

            // Métadonnées de base (Palier Zombie)
            note.setCreatedAt(LocalDateTime.now());
            note.setUpdatedAt(LocalDateTime.now());

            noteRepository.save(note);

            System.out.println("✅ Base de données prête pour le test !");

            // Création de la deuxième note (Note Zombie)
            Note zombie = new Note();
            zombie.setTitle("Note Zombie");
            String contentZombie = "# ALERTE ZOMBIE\nIls arrivent par le parking !";
            zombie.setContent(contentZombie);

            // --- LA LIGNE INDISPENSABLE ---
            zombie.setFolder(horror); // On la range dans le dossier horreur

            // Utilisation de ton utilitaire (Pour le Palier Zombie)
            // Note: Vérifie si Mamadou a ajouté le champ wordCount dans Note.java
            // zombie.setWordCount(MetadataUtils.countWords(contentZombie));

            // Les dates sont gérées par @CreatedDate de Mamadou,
            // mais tu peux les laisser pour être sûr.
            zombie.setCreatedAt(LocalDateTime.now());
            zombie.setUpdatedAt(LocalDateTime.now());

            noteRepository.save(zombie); // Là, ça va marcher ! ✅
        }
    }
}