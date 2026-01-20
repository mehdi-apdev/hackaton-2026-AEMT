import { useState, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FolderTree.css";
import type { Folder } from "../models/Folder";
import type { Note } from "../models/Note";
import FolderService from "../services/FolderService";
import NoteService from "../services/NoteService";
import { faFileCirclePlus, faFolderPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface FolderTreeProps {
  folder: Folder;
  onRefresh: () => void;
}

export const FolderTree = ({ folder, onRefresh }: FolderTreeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { id: activeNoteId } = useParams();

  const toggleOpen = (event: MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleCreateSubFolder = async (event: MouseEvent) => {
    event.stopPropagation();
    const name = prompt("Nom du sous-dossier :");
    if (!name) return;
    try {
      await FolderService.createFolder(name, folder.id);
      setIsOpen(true);
      onRefresh();
    } catch (error) {
      alert("Erreur creation dossier");
    }
  };

  const handleCreateNote = async (event: MouseEvent) => {
    event.stopPropagation();
    const title = prompt("Titre de la note :");
    if (!title) return;
    try {
      const newNote = await NoteService.createNote(title, folder.id);
      setIsOpen(true);
      onRefresh();
      navigate(`/note/${newNote.id}`);
    } catch (error) {
      alert("Erreur creation note");
    }
  };

  const handleDeleteFolder = async (event: MouseEvent) => {
    event.stopPropagation();
    const ok = confirm(`Supprimer le dossier "${folder.name}" et son contenu ?`);
    if (!ok) return;
    try {
      await FolderService.deleteFolder(folder.id);
      onRefresh();
    } catch (error) {
      alert("Impossible de supprimer le dossier");
    }
  };

  const handleNoteClick = (noteId: number, event: MouseEvent) => {
    event.stopPropagation();
    navigate(`/note/${noteId}`);
  };

  const handleDeleteNote = async (noteId: number, event: MouseEvent) => {
    event.stopPropagation();
    if (!confirm("Supprimer cette note ?")) return;
    try {
      await NoteService.deleteNote(noteId);
      onRefresh();
    } catch (error) {
      alert("Impossible de supprimer la note");
    }
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
          <button onClick={handleDeleteFolder} title="Supprimer le dossier" className="btn-icon btn-delete">
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="folder-content">
          {folder.children?.map((childFolder) => (
            <FolderTree key={childFolder.id} folder={childFolder} onRefresh={onRefresh} />
          ))}

          {folder.notes?.map((note: Note) => (
            <div key={note.id} className={`note-item ${String(activeNoteId) === String(note.id) ? "active" : ""}`} onClick={(event) => handleNoteClick(note.id, event)}>
              <span className="note-icon"><FontAwesomeIcon icon={faFileCirclePlus} /></span>
              <span className="note-title">{note.title}</span>
              <button
                className="btn-icon btn-delete note-delete"
                onClick={(event) => handleDeleteNote(note.id, event)}
                title="Supprimer la note"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}

          {!folder.children?.length && !folder.notes?.length && (
            <div className="empty-folder">Vide... pour l'instant</div>
          )}
        </div>
      )}
    </div>
  );
};
