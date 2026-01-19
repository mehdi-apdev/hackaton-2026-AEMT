/**
 * Interface correspondant à la table 'notes' de la BDD.
 */
export interface Note {
    id: number;              // BIGINT (PK)
    title: string;           // VARCHAR(255)
    content?: string;        // LONGTEXT (Optionnel car on ne le charge pas forcément dans l'arbre)
    
    // Dates ISO (ex: "2023-10-31T23:59:00")
    createdAt: string;       // DATETIME 
    updatedAt?: string;      // DATETIME
    
    folderId: number;        // BIGINT (FK) - Lien vers le parent
}