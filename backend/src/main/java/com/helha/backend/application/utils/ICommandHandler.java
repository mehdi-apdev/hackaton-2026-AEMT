package com.helha.backend.application.utils;

public interface ICommandHandler<I, O> {
    O handle(I input);
}
