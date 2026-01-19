package com.helha.backend.controllers.advices;

import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalErrors {

    // 1. Gère les erreurs de validation (@NotNull, @Size, etc.)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidationErrors(MethodArgumentNotValidException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problemDetail.setTitle("Validation Failed");
        problemDetail.setDetail("One or more fields are invalid.");

        Map<String, String> errors = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Invalid value",
                        (existing, replacement) -> existing
                ));

        problemDetail.setProperty("errors", errors);
        return problemDetail;
    }

    // 2. Gère les JSON mal formés (virgule manquante, accolade en trop...)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail handleJsonErrors(HttpMessageNotReadableException exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        problemDetail.setTitle("Malformed JSON");
        problemDetail.setDetail("The request body contains invalid JSON syntax.");
        return problemDetail;
    }

    // 3. Gère toutes les autres erreurs non prévues (Bug serveur)
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneralErrors(Exception exception) {
        ProblemDetail problemDetail = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                exception.getMessage()
        );
        problemDetail.setTitle("Internal Server Error");
        return problemDetail;
    }
}