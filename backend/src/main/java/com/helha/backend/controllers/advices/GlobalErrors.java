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

    //generate not found ressources (404)

    // using the already existing class "GenericNotFoundException"
    @ExceptionHandler(GenericNotFoundException.class)
    public ProblemDetail handleNotFound(GenericNotFoundException ex) {
        // GenericNotFoundException already contains the logic for ProblemDetail
        return ex.getBody();
    }


    // manage data base's errors (ex: forget folder_id)
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


    // safety net for any other errors (500)
    // prevent sending a "Stack Trace"
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