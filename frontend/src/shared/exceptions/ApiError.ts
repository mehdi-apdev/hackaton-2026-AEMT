export interface ErrorResponse {
    title: string;
    detail: string;
}

export class ApiError extends Error {
    constructor(message: string) {
        super(message);
    }

    static fromResponseJson(json: ErrorResponse): ApiError {
        console.error(json);
        // to be adapted according to what the Spring Boot Backend returns (ProblemDetail)
        return new ApiError(`${json.title}: ${json.detail}`);
    }
}