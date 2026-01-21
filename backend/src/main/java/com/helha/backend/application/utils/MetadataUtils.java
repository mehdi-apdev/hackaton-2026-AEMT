package com.helha.backend.application.utils;

import java.nio.charset.StandardCharsets;

public class MetadataUtils {

    // count the number of words
    public static int countWords(String content) {
        if (content == null || content.trim().isEmpty()) return 0;
        //we separate by any blank space (space,tab,line break)
        return content.trim().split("\\s+").length;
    }

    //count the number of lines
    public static int countLines(String content) {
        if (content == null || content.isEmpty()) return 0;

        // We separate using line breaks (\n or \r\n)
        return content.split("\r\n|\r|\n").length;
    }


    //count the number of characters
    public static int countCharacters(String content) {
        if (content == null) return 0;
        return content.length();
    }

    //calculate the Size in bytes
    public static long calculateSizeInBytes(String content) {
        if (content == null) return 0;
        //use of UTF-8 for a precise special character's calcul
        return content.getBytes(StandardCharsets.UTF_8).length;
    }
}