package com.helha.backend.application.services;

import com.helha.backend.domain.models.DbFolder;
import com.helha.backend.domain.models.DbNote;
import com.helha.backend.domain.repositories.IFolderRepository;
import com.helha.backend.domain.repositories.INoteRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CleanupService {

    private final INoteRepository noteRepository;
    private final IFolderRepository folderRepository;

    public CleanupService(INoteRepository noteRepository, IFolderRepository folderRepository) {
        this.noteRepository = noteRepository;
        this.folderRepository = folderRepository;
    }

    /**
     * Automatic task that runs every day at 4:00 AM.
     * It permanently deletes items that have been in the bin for more than 30 days.
     * Cron expression: Seconds Minutes Hours DayOfMonth Month DayOfWeek
     */
    @Scheduled(cron = "0 0 4 * * ?")
    @Transactional
    public void removeExpiredItems() {
        // Calculate the cutoff date (30 days ago)
        LocalDateTime thresholdDate = LocalDateTime.now().minusDays(30);

        System.out.println("🧹 Starting Bin Cleanup for items older than: " + thresholdDate);

        // 1. Delete expired notes
        List<DbNote> expiredNotes = noteRepository.findByDeletedTrueAndDeletedAtBefore(thresholdDate);
        if (!expiredNotes.isEmpty()) {
            noteRepository.deleteAll(expiredNotes);
            System.out.println("   -> Permanently deleted " + expiredNotes.size() + " notes.");
        }

        // 2. Delete expired folders
        List<DbFolder> expiredFolders = folderRepository.findByDeletedTrueAndDeletedAtBefore(thresholdDate);
        if (!expiredFolders.isEmpty()) {
            folderRepository.deleteAll(expiredFolders);
            System.out.println("   -> Permanently deleted " + expiredFolders.size() + " folders.");
        }

        System.out.println("✅ Bin Cleanup finished.");
    }
}