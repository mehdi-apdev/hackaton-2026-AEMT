import type { Note } from './Note';

/**
 * Interface correspondant à la table 'folders' de la BDD.
 * Supporte la récursivité via 'children'.
 */
export interface Folder {
    id: number;              // BIGINT (PK)
    name: string;            // VARCHAR(255)
    
    parentId?: number | null; // BIGINT (FK) - Null si c'est la racine
    
    // --- Champs virtuels (envoyés par le JSON du Backend, pas en table SQL) ---
    
    // La liste des sous-dossiers (C'est ça qui permet l'affichage récursif)
    children?: Folder[];     
    
    // La liste des notes contenues dans ce dossier
    notes?: Note[];
}