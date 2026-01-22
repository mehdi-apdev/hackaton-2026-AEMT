
/**
 * Interface corresponding to the 'notes' table in the DB.
 */
export interface Note {
    id: number;              // BIGINT (PK)
    title: string;           // VARCHAR(255)
    content?: string;        // LONGTEXT (Optional because not strictly loaded in the tree)
    
    // ISO Dates (e.g., "2023-10-31T23:59:00")
    createdAt: string;       // DATETIME 
    updatedAt?: string;      // DATETIME
    
    folderId: number;        // BIGINT (FK) - Link to parent
}