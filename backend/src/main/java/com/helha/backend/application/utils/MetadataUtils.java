package com.helha.backend.application.utils;

import java.nio.charset.StandardCharsets;

public class MetadataUtils {

    /**
     * Compte le nombre de mots (Palier Zombie)
     */
    public static int countWords(String content) {
        if (content == null || content.trim().isEmpty()) return 0;
        // On sépare par n'importe quel espace blanc (espace, tabulation, retour à la ligne)
        return content.trim().split("\\s+").length;
    }

    /**
     * Compte le nombre de lignes (Palier Zombie)
     */
    public static int countLines(String content) {
        if (content == null || content.isEmpty()) return 0;
        // On sépare par les retours à la ligne (\n ou \r\n)
        return content.split("\r\n|\r|\n").length;
    }

    /**
     * Compte le nombre de caractères (Palier Zombie)
     */
    public static int countCharacters(String content) {
        if (content == null) return 0;
        return content.length();
    }

    /**
     * Calcule la taille en octets (Palier Zombie)
     */
    public static long calculateSizeInBytes(String content) {
        if (content == null) return 0;
        // Utilise l'UTF-8 pour un calcul précis des caractères spéciaux
        return content.getBytes(StandardCharsets.UTF_8).length;
    }
}