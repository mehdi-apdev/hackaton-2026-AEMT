package com.helha.backend.controllers.advices;

import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;

@RestControllerAdvice
public class GlobalErrors {

    // 1. Gérer les ressources non trouvées (404)
    // Utilise la classe que tu as déjà !
    @ExceptionHandler(GenericNotFoundException.class)
    public ProblemDetail handleNotFound(GenericNotFoundException ex) {
        // Ta classe GenericNotFoundException contient déjà la logique ProblemDetail
        return ex.getBody();
    }

    // 2. Gérer les erreurs de base de données (ex: oublier le folder_id)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleIntegrityViolation(DataIntegrityViolationException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Erreur de contrainte : Assurez-vous que toutes les liaisons (comme le dossier parent) sont correctes."
        );
        problemDetail.setTitle("Données invalides ou manquantes");
        problemDetail.setType(URI.create("https://helha.be/errors/integrity-violation"));
        return problemDetail;
    }

    // 3. Filet de sécurité pour toutes les autres erreurs (500)
    // Évite d'envoyer une "Stack Trace" illisible au Frontend
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneralError(Exception ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Une erreur inattendue est survenue sur le serveur : " + ex.getMessage()
        );
        problemDetail.setTitle("Erreur Interne du Serveur");
        return problemDetail;
    }
}