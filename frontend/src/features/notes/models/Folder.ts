
import type { Note } from './Note';

/**
 * Interface corresponding to the 'folders' table in the DB.
 * Supports recursion via 'children'.
 */
export interface Folder {
    id: number;              // BIGINT (PK)
    name: string;            // VARCHAR(255)
    
    parentId?: number | null; // BIGINT (FK) - Null if it is the root
    
    // --- Virtual fields (sent by Backend JSON, not in SQL table) ---
    
    // List of subfolders (Enables recursive display)
    children?: Folder[];     
    
    // List of notes contained in this folder
    notes?: Note[];
}