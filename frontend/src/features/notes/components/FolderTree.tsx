import { useState, useEffect, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FolderTree.css";
import type { Folder } from "../models/Folder";
import type { Note } from "../models/Note";
import FolderService from "../services/FolderService";
import NoteService from "../services/NoteService";
import { faFileAlt, faFileCirclePlus, faFolderPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModal } from "../../../shared/context/ModalContext";

interface FolderTreeProps {
  folder: Folder;
  openFolderIds: Set<number>;
  onToggle: (folderId: number) => void;
  onOpen: (folderId: number) => void;
  onRefresh: () => void;
}

type ContextMenuState = {
  type: "folder" | "note";
  id: number;
  name: string;
  x: number;
  y: number;
} | null;

export const FolderTree = ({ folder, openFolderIds, onToggle, onOpen, onRefresh }: FolderTreeProps) => {
  const isOpen = openFolderIds.has(folder.id);
  const navigate = useNavigate();
  const { id: activeNoteId } = useParams();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  // Utilisation de la Modale Globale
  const { openInputModal, openConfirmModal } = useModal();

  const toggleOpen = (event: MouseEvent) => {
    event.stopPropagation();
    onToggle(folder.id);
  };

  // --- ACTIONS (CREATION) ---
  const handleCreateSubFolder = (event: MouseEvent) => {
    event.stopPropagation();
    onOpen(folder.id);
    openInputModal(
      "Nouveau Sous-Dossier",
      "Nom du dossier...",
      async (name) => {
        if (!name.trim()) return;
        await FolderService.createFolder(name, folder.id);
        onRefresh();
      }
    );
  };

  const handleCreateNote = (event: MouseEvent) => {
    event.stopPropagation();
    onOpen(folder.id);
    openInputModal(
      "Nouvelle Note",
      "Titre de la note...",
      async (title) => {
        if (!title.trim()) return;
        const newNote = await NoteService.createNote(title, folder.id);
        onRefresh();
        navigate(`/note/${newNote.id}`);
      }
    );
  };

  // --- ACTIONS (SUPPRESSION) ---
  const handleDeleteFolder = (event: MouseEvent) => {
    event.stopPropagation();
    openConfirmModal(
      "Supprimer le dossier ?",
      `Voulez-vous vraiment détruire "${folder.name}" et tout son contenu ?`,
      async () => {
        await FolderService.deleteFolder(folder.id);
        onRefresh();
      }
    );
  };

  const handleDeleteNote = (noteId: number, noteTitle: string, event: MouseEvent) => {
    event.stopPropagation();
    openConfirmModal(
      "Supprimer la note ?",
      `Voulez-vous réduire "${noteTitle}" en cendres ?`,
      async () => {
        await NoteService.deleteNote(noteId);
        onRefresh();
      }
    );
  };

  const handleNoteClick = (noteId: number, event: MouseEvent) => {
    event.stopPropagation();
    navigate(`/note/${noteId}`);
  };

  // --- CONTEXT MENU (RENOMMER) ---
  const handleContextMenu = (event: MouseEvent, type: "folder" | "note", id: number, name: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ type, id, name, x: event.clientX, y: event.clientY });
  };

  const handleRename = () => {
    if (!contextMenu) return;
    
    // On utilise aussi la modale pour le renommage !
    openInputModal(
      `Renommer ${contextMenu.type === 'folder' ? 'le dossier' : 'la note'}`,
      contextMenu.name, // Valeur par défaut (placeholder ici, idéalement input value)
      async (newName) => {
        if (!newName || newName === contextMenu.name) return;
        
        if (contextMenu.type === "folder") {
          await FolderService.renameFolder(contextMenu.id, newName);
        } else {
          const note = await NoteService.getNoteById(contextMenu.id);
          await NoteService.updateNote(contextMenu.id, newName, note.content || "");
        }
        onRefresh();
      }
    );
    setContextMenu(null);
  };

  // Fermeture du menu contextuel au clic ailleurs
  useEffect(() => {
    if (!contextMenu) return;
    const closeMenu = () => setContextMenu(null);
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("click", closeMenu);
    window.addEventListener("contextmenu", closeMenu);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("contextmenu", closeMenu);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu]);

  return (
    <div className="folder-tree">
      <div
        className="folder-header"
        onClick={toggleOpen}
        onContextMenu={(event) => handleContextMenu(event, "folder", folder.id, folder.name)}
      >
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
          {folder.children?.map((childFolder) => (
            <FolderTree
              key={childFolder.id}
              folder={childFolder}
              openFolderIds={openFolderIds}
              onToggle={onToggle}
              onOpen={onOpen}
              onRefresh={onRefresh}
            />
          ))}

          {folder.notes?.map((note: Note) => (
            <div
              key={note.id}
              className={`note-item ${String(activeNoteId) === String(note.id) ? "active" : ""}`}
              onClick={(event) => handleNoteClick(note.id, event)}
              onContextMenu={(event) => handleContextMenu(event, "note", note.id, note.title)}
            >
              <span className="note-icon">
                <FontAwesomeIcon icon={faFileAlt} />
              </span>
              <span className="note-title">{note.title}</span>
              <button
                className="btn-icon btn-delete note-delete"
                onClick={(event) => handleDeleteNote(note.id, note.title, event)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))}

          {!folder.children?.length && !folder.notes?.length && (
            <div className="empty-folder">Vide...</div>
          )}
        </div>
      )}

      {/* Menu Contextuel Personnalisé */}
      {contextMenu && (
        <div 
          className="context-menu" 
          style={{ 
            top: contextMenu.y, 
            left: contextMenu.x,
            position: 'fixed',
            background: '#333',
            border: '1px solid #555',
            padding: '5px',
            borderRadius: '4px',
            zIndex: 9999
          }}
        >
          <button 
            type="button" 
            className="context-menu-item" 
            onClick={handleRename}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '5px 10px',
              textAlign: 'left',
              width: '100%'
            }}
          >
            Renommer
          </button>
        </div>
      )}
    </div>
  );
};
