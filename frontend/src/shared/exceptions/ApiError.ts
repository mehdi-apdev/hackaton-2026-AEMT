export class ApiError extends Error {
    constructor(message: string) {
        super(message);
    }

    static fromResponseJson(json: any): ApiError {
        console.error(json);
        // à adapter selon ce que le Backend Spring Boot renvoie (ProblemDetail)
        return new ApiError(`${json.title}: ${json.detail}`);
    }
}