package com.helha.backend.application.utils;

import java.nio.charset.StandardCharsets;

public class MetadataUtils {
    // La calculatrice pour les mots
    public static int countWords(String content) {
        if (content == null) return 0;
        return content.trim().split("\\s+").length;
    }
    // La calculatrice pour la taille
    public static long calculateBytes(String content) {
        if (content == null) return 0;
        return content.getBytes().length;
    }
}