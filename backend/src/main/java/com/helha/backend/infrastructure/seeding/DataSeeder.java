package com.helha.backend.infrastructure.seeding;

import com.helha.backend.domain.service.MetadataUtils;
import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.repositories.IFolderRepository;
import com.helha.backend.domain.repositories.INoteRepository;
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

            //create a root folder
            DbFolder root = new DbFolder();
            root.setName("Ma Bibliothèque Hantée");
            root = folderRepository.save(root);

            // create a subfolder (Recursion)
            DbFolder horror = new DbFolder();
            horror.setName("Histoires de Zombies");
            horror.setParent(root); // use "parent"
            horror = folderRepository.save(horror);

            //Create a note in this folder
            DbNote dbNote = new DbNote();
            dbNote.setTitle("L'invasion du 31 octobre");
            String content1 = "# Alerte Zombie\nIls sont partout dans l'école !";
            dbNote.setContent(content1);
            dbNote.setFolder(horror);

            // Métadata
            dbNote.setWordCount(MetadataUtils.countWords(content1));
            dbNote.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content1));
            dbNote.setLineCount(MetadataUtils.countLines(content1));

            noteRepository.save(dbNote);

            //creation of the second note
            DbNote zombie = new DbNote();
            zombie.setTitle("Note Zombie");
            String contentZombie = "# ALERTE ZOMBIE\nIls arrivent par le parking !";
            zombie.setContent(contentZombie);
            zombie.setFolder(horror); // essential : nullable = false

            // Métadata
            zombie.setWordCount(MetadataUtils.countWords(contentZombie));
            zombie.setLineCount(MetadataUtils.countLines(contentZombie));

            noteRepository.save(zombie);

            System.out.println("✅ Base de données prête pour le test !");
        }
    }
}