interface ImportMetaEnv {
      // Defines the URL of the Spring Boot backend
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}