import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './FolderTree.css';
import type { Folder } from '../models/Folder';
import type { Note } from '../models/Note';
import FolderService from '../services/FolderService';
import NoteService from '../services/NoteService';

interface FolderTreeProps {
  folder: Folder;
  onRefresh: () => void; // Fonction obligatoire pour rafraîchir l'arbre parent
}

export const FolderTree = ({ folder, onRefresh }: FolderTreeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { id: activeNoteId } = useParams(); // Pour surligner la note active (optionnel)

  // Ouvrir/Fermer le dossier
  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  // --- ACTIONS DOSSIER ---

  const handleCreateSubFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const name = prompt("📂 Nom du sous-dossier :");
    if (name) {
      try {
        await FolderService.createFolder(name, folder.id);
        setIsOpen(true); // On ouvre le dossier pour voir le nouveau bébé
        onRefresh();
      } catch (err) {
        alert("Erreur création dossier");
      }
    }
  };

  const handleCreateNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const title = prompt("📝 Titre de la note :");
    if (title) {
      try {
        const newNote = await NoteService.createNote(title, folder.id);
        setIsOpen(true);
        onRefresh();
        navigate(`/note/${newNote.id}`); // On redirige direct vers la nouvelle note
      } catch (err) {
        alert("Erreur création note");
      }
    }
  };

  const handleDeleteFolder = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`🗑️ Supprimer le dossier "${folder.name}" et tout son contenu ?`)) {
      try {
        await FolderService.deleteFolder(folder.id);
        onRefresh();
      } catch (err) {
        alert("Impossible de supprimer le dossier");
      }
    }
  };

  // --- ACTIONS NOTE ---

  const handleNoteClick = (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/note/${noteId}`);
  };

  const handleDeleteNote = async (noteId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("🗑️ Supprimer cette note ?")) {
      try {
        await NoteService.deleteNote(noteId);
        onRefresh();
      } catch (err) {
        alert("Impossible de supprimer la note");
      }
    }
  };

  return (
    <div className="folder-tree">
      {/* En-tête du dossier */}
      <div className="folder-header" onClick={toggleOpen}>
        <span className="folder-icon">
          {isOpen ? '📂' : '📁'}
        </span>
        <span className="folder-name">{folder.name}</span>
        
        {/* Boutons d'action (visibles au survol grâce au CSS) */}
        <div className="folder-actions">
          <button onClick={handleCreateSubFolder} title="Nouveau dossier" className="btn-icon">➕📂</button>
          <button onClick={handleCreateNote} title="Nouvelle note" className="btn-icon">➕📝</button>
          <button onClick={handleDeleteFolder} title="Supprimer le dossier" className="btn-icon btn-delete">🗑️</button>
        </div>
      </div>

      {/* Contenu du dossier (Enfants + Notes) */}
      {isOpen && (
        <div className="folder-content">
          {/* 1. Affichage récursif des sous-dossiers */}
          {folder.children?.map((childFolder) => (
            <FolderTree 
              key={childFolder.id} 
              folder={childFolder} 
              onRefresh={onRefresh} // Propagation vitale !
            />
          ))}

          {/* 2. Affichage des notes */}
          {folder.notes?.map((note: Note) => (
            <div 
              key={note.id} 
              className={`note-item ${String(activeNoteId) === String(note.id) ? 'active' : ''}`}
              onClick={(e) => handleNoteClick(note.id, e)}
            >
              <span className="note-icon">📄</span>
              <span className="note-title">{note.title}</span>
              <button 
                className="btn-icon btn-delete note-delete"
                onClick={(e) => handleDeleteNote(note.id, e)}
                title="Supprimer la note"
              >
                🗑️
              </button>
            </div>
          ))}
          
          {/* Message si vide */}
          {(!folder.children?.length && !folder.notes?.length) && (
            <div className="empty-folder">Vide... pour l'instant 👻</div>
          )}
        </div>
      )}
    </div>
  );
};