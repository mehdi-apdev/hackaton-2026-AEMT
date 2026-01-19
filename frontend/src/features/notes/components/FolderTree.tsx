import { useState } from 'react';
import type { Folder } from '../models/Folder';
import type { Note } from '../models/Note';
import './FolderTree.css';

interface FolderTreeProps {
    folder: Folder;
}

export const FolderTree = ({ folder }: FolderTreeProps) => {
    // État local : est-ce que ce dossier est ouvert ou fermé ?
    const [isOpen, setIsOpen] = useState(true); // Par défaut ouvert pour voir le résultat vite

    // Vérification : A-t-on des enfants ou des notes ?
    const hasChildren = folder.children && folder.children.length > 0;
    const hasNotes = folder.notes && folder.notes.length > 0;
    const isEmpty = !hasChildren && !hasNotes;

    const toggleOpen = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
    };

    const handleNoteClick = (note: Note) => {
        console.log("Note cliquée :", note.title);
        // Plus tard, on appellera une fonction ici pour ouvrir l'éditeur
    };

    return (
        <div className="tree-node">
            {/* 1. Affichage du Dossier lui-même */}
            <div 
                className={`folder-label ${isEmpty ? 'empty' : ''}`} 
                onClick={toggleOpen}
            >
                <span style={{ marginRight: '8px' }}>
                    {/* Icône changeante : Dossier ouvert ou fermé */}
                    {isOpen ? '📂' : '📁'} 
                </span>
                <span>{folder.name}</span>
            </div>

            {/* 2. Affichage du Contenu (Récursif) */}
            {isOpen && !isEmpty && (
                <div className="folder-children">
                    
                    {/* A. Appel Récursif pour les sous-dossiers */}
                    {folder.children?.map((childFolder) => (
                        <FolderTree key={childFolder.id} folder={childFolder} />
                    ))}

                    {/* B. Affichage des notes de ce dossier */}
                    {folder.notes?.map((note) => (
                        <div 
                            key={note.id} 
                            className="note-item"
                            onClick={() => handleNoteClick(note)}
                        >
                            <span style={{ marginRight: '8px' }}>📄</span>
                            {note.title}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};