package com.helha.backend.application.utils;

public interface IQueryHandler<I, O> {
    O handle(I input);
}