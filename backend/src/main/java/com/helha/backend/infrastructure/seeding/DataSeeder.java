package com.helha.backend.infrastructure.seeding;


import com.helha.backend.application.utils.MetadataUtils;
import com.helha.backend.infrastructure.entities.DbFolder;
import com.helha.backend.infrastructure.entities.DbNote;
import com.helha.backend.infrastructure.repository.IFolderRepository;
import com.helha.backend.infrastructure.repository.INoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component // Indique à Spring de lancer cette classe au démarrage
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private IFolderRepository folderRepository;

    @Autowired
    private INoteRepository noteRepository;

    @Override
    public void run(String... args) throws Exception {
        // On ne remplit que si la base est vide
        if (folderRepository.count() == 0) {
            System.out.println("🎃 Initialisation des données Spooky...");

            // 1. Créer un dossier racine
            DbFolder root = new DbFolder();
            root.setName("Ma Bibliothèque Hantée");
            root = folderRepository.save(root);

            // 2. Créer un sous-dossier (pour tester la récursivité demandée)
            DbFolder horror = new DbFolder();
            horror.setName("Histoires de Zombies");
            horror.setParentFolder(root);
            horror = folderRepository.save(horror);

            // 3. Créer une note dans ce dossier
            DbNote note = new DbNote();
            note.setName("L'invasion du 31 octobre");
            note.setContent("# Alerte Zombie\nIls sont partout dans l'école !");
            note.setFolder(horror);

            // Métadonnées de base (Palier Zombie)
            note.setCreatedAt(LocalDateTime.now());
            note.setUpdatedAt(LocalDateTime.now());

            noteRepository.save(note);

            System.out.println("✅ Base de données prête pour le test !");

            // Dans ton DataSeeder.java
            DbNote zombie = new DbNote();
            zombie.setName("Note Zombie");
            String content = "# ALERTE ZOMBIE\nIls arrivent par le parking !";
            zombie.setContent(content);

            // Utilisation de ton utilitaire pour remplir les champs
            zombie.setWordCount(MetadataUtils.countWords(content));       // ex: 7 mots
            zombie.setCreatedAt(LocalDateTime.now());
            zombie.setUpdatedAt(LocalDateTime.now());


            noteRepository.save(zombie);
        }
    }
}