package com.helha.backend.infrastructure.seeding;

import com.helha.backend.infrastructure.database.entities.DbFolder;
import com.helha.backend.infrastructure.database.entities.DbNote;
import com.helha.backend.infrastructure.database.repository.IFolderRepository;
import com.helha.backend.infrastructure.database.repository.INoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private IFolderRepository folderRepository;

    @Autowired
    private INoteRepository noteRepository;

    @Override
    public void run(String... args) throws Exception {
        if (folderRepository.count() == 0) {
            System.out.println("🎃 Initialisation des données Spooky...");

            // 1. Créer un dossier racine
            DbFolder root = new DbFolder();
            root.setName("Ma Bibliothèque Hantée");
            root = folderRepository.save(root);

            // 2. Créer un sous-dossier (Récursivité)
            DbFolder horror = new DbFolder();
            horror.setName("Histoires de Zombies");
            horror.setParent(root); // Utilise "parent"
            horror = folderRepository.save(horror);

            // 3. Créer une note dans ce dossier
            DbNote dbNote = new DbNote();
            dbNote.setTitle("L'invasion du 31 octobre");
            String content1 = "# Alerte Zombie\nIls sont partout dans l'école !";
            dbNote.setContent(content1);
            dbNote.setFolder(horror); // Changé setDbFolder -> setFolder pour correspondre à l'entité

            // Métadonnées (Calculées par ton utilitaire)
            // Note: Si Mamadou n'a pas encore ajouté ces champs dans DbNote.java,
            // commente ces lignes pour que ça compile.
            // dbNote.setWordCount(MetadataUtils.countWords(content1));
            // dbNote.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content1));

            noteRepository.save(dbNote);

            // 4. Création de la deuxième note (Note Zombie)
            DbNote zombie = new DbNote();
            zombie.setTitle("Note Zombie");
            String contentZombie = "# ALERTE ZOMBIE\nIls arrivent par le parking !";
            zombie.setContent(contentZombie);
            zombie.setFolder(horror); // INDISPENSABLE : nullable = false

            // Métadonnées Palier Zombie
            // zombie.setWordCount(MetadataUtils.countWords(contentZombie));
            // zombie.setLineCount(MetadataUtils.countLines(contentZombie));

            noteRepository.save(zombie);

            System.out.println("✅ Base de données prête pour le test !");
        }
    }
}