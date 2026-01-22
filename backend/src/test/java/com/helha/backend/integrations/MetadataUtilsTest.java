package com.helha.backend.unit;

import com.helha.backend.domain.service.MetadataUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MetadataUtilsTest {

    @Test
    @DisplayName("Calcul correct des mots, lignes et caractères")
    void count_shouldBeAccurate() {
        String text = "Hello\nWorld !";
        // 3 mots ("Hello", "World", "!"), 2 lignes, 13 carac

        assertEquals(3, MetadataUtils.countWords(text));
        assertEquals(2, MetadataUtils.countLines(text));
        assertEquals(13, MetadataUtils.countCharacters(text));
    }

    @Test
    @DisplayName("Gestion des entrées nulles ou vides")
    void nullHandling_shouldNotCrash() {
        assertEquals(0, MetadataUtils.countWords(null));
        assertEquals(0, MetadataUtils.countLines(""));
        assertEquals(0, MetadataUtils.calculateSizeInBytes(null));
    }
}