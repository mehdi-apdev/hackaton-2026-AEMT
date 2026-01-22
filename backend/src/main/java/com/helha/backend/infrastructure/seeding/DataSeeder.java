package com.helha.backend.infrastructure.seeding;

import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.models.DbUser; // Import ajouté
import com.helha.backend.domain.repositories.IFolderRepository;
import com.helha.backend.domain.repositories.INoteRepository;
import com.helha.backend.domain.repositories.IUserRepository; // Import ajouté
import com.helha.backend.domain.service.MetadataUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder; // Pour le mot de passe
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private IFolderRepository folderRepository;

    @Autowired
    private INoteRepository noteRepository;

    @Autowired
    private IUserRepository userRepository; // Ajouté pour gérer l'utilisateur

    @Autowired
    private PasswordEncoder passwordEncoder; // Ajouté pour encoder le mot de passe

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) { // On vérifie si un utilisateur existe
            System.out.println("🎃 Initialisation des données Spooky...");

            // 1. Créer un utilisateur par défaut (indispensable pour user_id)
            DbUser admin = new DbUser();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("p@ssword"));
            admin.setRole("USER");
            admin = userRepository.save(admin);

            // 2. Créer un dossier racine lié à l'utilisateur
            DbFolder root = new DbFolder();
            root.setName("Ma Bibliothèque Hantée");
            root.setUser(admin); // FIX: On lie l'utilisateur au dossier
            root = folderRepository.save(root);

            // 3. Créer un sous-dossier lié à l'utilisateur
            DbFolder horror = new DbFolder();
            horror.setName("Histoires de Zombies");
            horror.setParent(root);
            horror.setUser(admin); // FIX: On lie l'utilisateur au dossier
            horror = folderRepository.save(horror);

            // 4. Créer des notes liées à l'utilisateur et au dossier
            DbNote dbNote = new DbNote();
            dbNote.setTitle("L'invasion du 31 octobre");
            String content1 = "# Alerte Zombie\nIls sont partout dans l'école !";
            dbNote.setContent(content1);
            dbNote.setFolder(horror);
            dbNote.setUser(admin); // FIX: On lie l'utilisateur à la note

            // Métadonnées
            dbNote.setWordCount(MetadataUtils.countWords(content1));
            dbNote.setSizeInBytes(MetadataUtils.calculateSizeInBytes(content1));
            dbNote.setLineCount(MetadataUtils.countLines(content1));
            noteRepository.save(dbNote);

            DbNote zombie = new DbNote();
            zombie.setTitle("Note Zombie");
            String contentZombie = "# ALERTE ZOMBIE\nIls arrivent par le parking !";
            zombie.setContent(contentZombie);
            zombie.setFolder(horror);
            zombie.setUser(admin); // FIX: On lie l'utilisateur à la note

            // Métadonnées
            zombie.setWordCount(MetadataUtils.countWords(contentZombie));
            zombie.setLineCount(MetadataUtils.countLines(contentZombie));
            noteRepository.save(zombie);

            System.out.println("✅ Base de données prête avec un utilisateur et ses dossiers !");
        }
    }
}