package com.helha.backend.controllers.advices;

import com.helha.backend.controllers.exceptions.GenericNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException; // Import important
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalErrors {

    @ExceptionHandler(GenericNotFoundException.class)
    public ProblemDetail handleNotFound(GenericNotFoundException ex) {
        return ex.getBody();
    }

    // Handles authentication errors (incorrect username or password)
    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail handleBadCredentials(BadCredentialsException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.UNAUTHORIZED,
                "Nom d'utilisateur ou mot de passe incorrect."
        );
        problemDetail.setTitle("Authentification échouée");
        return problemDetail;
    }

    // Handles validation errors @NotBlank, @NotNull (Test ValidationDonneesIT)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationErrors(MethodArgumentNotValidException ex) {
        String detail = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Erreur de validation : " + detail
        );
        problemDetail.setTitle("Données invalides");
        return problemDetail;
    }

    // Handles database integrity violations (e.g., foreign key constraints)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail handleIntegrityViolation(DataIntegrityViolationException ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST,
                "Erreur de contrainte : Assurez-vous que toutes les liaisons sont correctes."
        );
        problemDetail.setTitle("Données invalides ou manquantes");
        return problemDetail;
    }

    // Handles all other uncaught exceptions
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneralError(Exception ex) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Une erreur inattendue est survenue : " + ex.getMessage()
        );
        problemDetail.setTitle("Erreur Interne du Serveur");
        return problemDetail;
    }
}