package com.helha.backend.controllers.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.ErrorResponseException;

public class GenericNotFoundException extends ErrorResponseException {

    public GenericNotFoundException(Long id, String resourceName) {
        super(HttpStatus.NOT_FOUND, asProblemDetail(id, resourceName), null);
    }

    private static ProblemDetail asProblemDetail(Long id, String resourceName) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.NOT_FOUND,
                String.format("%s with id %d is not found", resourceName, id)
        );
        problemDetail.setTitle("Resource Not Found");
        return problemDetail;
    }
}