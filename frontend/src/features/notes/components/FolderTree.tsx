import { useState, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FolderTree.css";
import type { Folder } from "../models/Folder";
import type { Note } from "../models/Note";
import FolderService from "../services/FolderService";
import NoteService from "../services/NoteService";
import { faFileCirclePlus, faFolderPlus, faTrash, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModal } from "../../../shared/context/ModalContext";

interface FolderTreeProps {
  folder: Folder;
  onRefresh: () => void;
}

export const FolderTree = ({ folder, onRefresh }: FolderTreeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { id: activeNoteId } = useParams();
  
  // On récupère notre super télécommande
  const { openInputModal, openConfirmModal } = useModal();

  const toggleOpen = (event: MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  // --- ACTIONS ---

  const handleCreateSubFolder = (e: MouseEvent) => {
    e.stopPropagation();
    openInputModal(
      "Nouveau Sous-Dossier",
      "Nom du dossier...",
      async (name) => {
        if (!name.trim()) return;
        await FolderService.createFolder(name, folder.id);
        onRefresh();
        setIsOpen(true);
      }
    );
  };

  const handleCreateNote = (e: MouseEvent) => {
    e.stopPropagation();
    openInputModal(
      "Nouvelle Note",
      "Titre de la note...",
      async (title) => {
        if (!title.trim()) return;
        const newNote = await NoteService.createNote(title, folder.id);
        onRefresh();
        setIsOpen(true);
        navigate(`/note/${newNote.id}`);
      }
    );
  };

  const handleDeleteFolder = (e: MouseEvent) => {
    e.stopPropagation();
    openConfirmModal(
      "Supprimer le dossier ?",
      `Voulez-vous vraiment détruire "${folder.name}" et tout son contenu ?`,
      async () => {
        await FolderService.deleteFolder(folder.id);
        onRefresh();
      }
    );
  };

  const handleDeleteNote = (noteId: number, noteTitle: string, e: MouseEvent) => {
    e.stopPropagation();
    openConfirmModal(
      "Supprimer la note ?",
      `Voulez-vous réduire "${noteTitle}" en cendres ?`,
      async () => {
        await NoteService.deleteNote(noteId);
        onRefresh();
      }
    );
  };

  const handleNoteClick = (noteId: number, e: MouseEvent) => {
    e.stopPropagation();
    navigate(`/note/${noteId}`);
  };

  return (
    <div className="folder-tree">
      <div className="folder-header" onClick={toggleOpen}>
        <span className="folder-icon">{isOpen ? "v" : ">"}</span>
        <span className="folder-name">{folder.name}</span>

        <div className="folder-actions">
          <button onClick={handleCreateSubFolder} title="Nouveau dossier" className="btn-icon">
            <FontAwesomeIcon icon={faFolderPlus} />
          </button>
          <button onClick={handleCreateNote} title="Nouvelle note" className="btn-icon">
            <FontAwesomeIcon icon={faFileCirclePlus} />
          </button>
          <button onClick={handleDeleteFolder} title="Supprimer" className="btn-icon btn-delete">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="folder-content">
          {folder.children?.map((child) => (
            <FolderTree key={child.id} folder={child} onRefresh={onRefresh} />
          ))}

          {folder.notes?.map((note) => (
            <div 
              key={note.id} 
              className={`note-item ${String(activeNoteId) === String(note.id) ? "active" : ""}`} 
              onClick={(e) => handleNoteClick(note.id, e)}
            >
              <span className="note-icon"><FontAwesomeIcon icon={faFileAlt} /></span>
              <span className="note-title">{note.title}</span>
              <button className="btn-icon btn-delete note-delete" onClick={(e) => handleDeleteNote(note.id, note.title, e)}>
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}
          
          {(!folder.children?.length && !folder.notes?.length) && (
            <div className="empty-folder">Vide...</div>
          )}
        </div>
      )}
    </div>
  );
};