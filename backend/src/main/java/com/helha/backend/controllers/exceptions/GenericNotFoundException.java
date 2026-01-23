package com.helha.backend.controllers.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

public class GenericNotFoundException extends ErrorResponseException {

    public GenericNotFoundException(Long id, String resourceName) {
        super(HttpStatus.NOT_FOUND, asProblemDetail(id, resourceName), null);
    }

    // Creates a ProblemDetail for a not found resource
    private static ProblemDetail asProblemDetail(Long id, String resourceName) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                String.format("%s avec l'id %d est introuvable", resourceName, id)
        );
        problemDetail.setTitle("Ressource non trouvée");
        return problemDetail;
    }
}