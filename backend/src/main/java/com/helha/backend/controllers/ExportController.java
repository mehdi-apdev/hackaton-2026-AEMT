package com.helha.backend.controllers;

import com.helha.backend.application.services.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/export")
@RequiredArgsConstructor // Génère le constructeur pour les champs 'final'
public class ExportController {

    private final ExportService exportService; // Doit être final pour Lombok

    @GetMapping("/zip")
    public ResponseEntity<byte[]> downloadZip() {
        try {
            byte[] zipData = exportService.exportUserNotesToZip();

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"mes_notes_hantees.zip\"")
                    // "application/zip" est plus précis que "application/octet-stream"
                    .contentType(MediaType.valueOf("application/zip"))
                    .body(zipData);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        byte[] pdfContent = exportService.exportAllNotesToPdf();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"SpookyNotes_Export.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }
}