interface ImportMetaEnv {
    // Définit l'URL du backend Spring Boot
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}