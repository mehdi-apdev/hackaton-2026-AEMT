import { useState, useEffect, type MouseEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FolderTree.css";
import type { Folder } from "../models/Folder";
import type { Note } from "../models/Note";
import FolderService from "../services/FolderService";
import NoteService from "../services/NoteService";
import { faFileAlt, faEllipsisV, faFolderOpen, faFolder } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useModal } from "../../../shared/context/ModalContext";

// Props enrichies
interface FolderTreeProps {
  folder: Folder;
  openFolderIds?: Set<number>;
  onToggle?: (folderId: number) => void;
  onOpen?: (folderId: number) => void;
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
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const isOpen = openFolderIds ? openFolderIds.has(folder.id) : localIsOpen;

  const navigate = useNavigate();
  const { id: activeNoteId } = useParams();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const { openInputModal, openConfirmModal } = useModal();

  const toggleOpen = (event: MouseEvent) => {
    event.stopPropagation();
    if (onToggle) {
      onToggle(folder.id);
    } else {
      setLocalIsOpen(!localIsOpen);
    }
  };

  // --- ACTIONS (CREATION) ---
  const handleCreateSubFolder = () => {
    if (!contextMenu) return;
    openInputModal(
      "Nouveau Sous-Dossier",
      "Nom du dossier...",
      async (name) => {
        if (!name.trim()) return;
        await FolderService.createFolder(name, contextMenu.id);
        onRefresh();
        if (onOpen) onOpen(contextMenu.id);
        else setLocalIsOpen(true);
      }
    );
    setContextMenu(null);
  };

  const handleCreateNote = () => {
    if (!contextMenu) return;
    openInputModal(
      "Nouvelle Note",
      "Titre de la note...",
      async (title) => {
        if (!title.trim()) return;
        const newNote = await NoteService.createNote(title, contextMenu.id);
        onRefresh();
        if (onOpen) onOpen(contextMenu.id);
        else setLocalIsOpen(true);
        navigate(`/note/${newNote.id}`);
      }
    );
    setContextMenu(null);
  };

  // --- ACTIONS (DELETION) ---
  const handleDelete = () => {
    if (!contextMenu) return;
    const isFolder = contextMenu.type === "folder";
    const msg = isFolder
      ? `Voulez-vous vraiment détruire "${contextMenu.name}" et tout son contenu ?`
      : `Voulez-vous réduire "${contextMenu.name}" en cendres ?`;

    openConfirmModal(
      `Supprimer ${isFolder ? "le dossier" : "la note"} ?`,
      msg,
      async () => {
        if (isFolder) await FolderService.deleteFolder(contextMenu.id);
        else await NoteService.deleteNote(contextMenu.id);
        onRefresh();
      }
    );
    setContextMenu(null);
  };

  const handleRename = () => {
    if (!contextMenu) return;
    openInputModal(
      `Renommer ${contextMenu.type === 'folder' ? 'le dossier' : 'la note'}`,
      contextMenu.name,
      async (newName) => {
        if (!newName || newName === contextMenu.name) return;

        if (contextMenu.type === "folder") {
          await FolderService.renameFolder(contextMenu.id, newName);
        } else {
          const note = await NoteService.getNoteById(contextMenu.id);
          await NoteService.updateNote(contextMenu.id, newName, note.content || "");
        }
        onRefresh();
      },
      contextMenu.name
    );
    setContextMenu(null);
  };

  const handleNoteClick = (noteId: number, event: MouseEvent) => {
    event.stopPropagation();
    navigate(`/note/${noteId}`);
  };

  // --- MENU ---
  const openMenu = (event: MouseEvent, type: "folder" | "note", id: number, name: string) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({ type, id, name, x: event.clientX, y: event.clientY });
  };

  useEffect(() => {
    if (!contextMenu) return;
    const closeMenu = () => setContextMenu(null);
    window.addEventListener("click", closeMenu);
    window.addEventListener("contextmenu", closeMenu); // also close on right-click elsewhere
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("contextmenu", closeMenu);
    };
  }, [contextMenu]);

  return (
    <div className="folder-tree">
      <div
        className="folder-header"
        onClick={toggleOpen}
        onContextMenu={(e) => openMenu(e, "folder", folder.id, folder.name)}
      >
        <span className="folder-icon">
          <FontAwesomeIcon icon={isOpen ? faFolderOpen : faFolder} />
        </span>
        <span className="folder-name">{folder.name}</span>

        {/* Button Menu for those who don't have right click or on mobile :3 */}
        <button
          className="btn-options"
          onClick={(e) => openMenu(e, "folder", folder.id, folder.name)}
        >
          <FontAwesomeIcon icon={faEllipsisV} />
        </button>
      </div>

      {isOpen && (
        <div className="folder-content">
          {folder.children?.map((child) => (
            <FolderTree
              key={child.id}
              folder={child}
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
              onClick={(e) => handleNoteClick(note.id, e)}
              onContextMenu={(e) => openMenu(e, "note", note.id, note.title)}
            >
              <span className="note-icon">
                <FontAwesomeIcon icon={faFileAlt} />
              </span>
              <span className="note-title">{note.title}</span>

              <button
                className="btn-options"
                onClick={(e) => openMenu(e, "note", note.id, note.title)}
              >
                <FontAwesomeIcon icon={faEllipsisV} />
              </button>
            </div>
          ))}

          {!folder.children?.length && !folder.notes?.length && (
            <div className="empty-folder">Vide...</div>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="context-menu"
          style={{
            top: contextMenu.y,
            left: contextMenu.x,
            position: 'fixed',
            background: '#222',
            border: '1px solid var(--orange)',
            padding: '5px 0',
            borderRadius: '6px',
            zIndex: 9999,
            boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
            minWidth: '150px',
            color: '#eee'
          }}
        >
          {contextMenu.type === "folder" && (
            <>
              <div className="menu-item" onClick={handleCreateSubFolder}>+ Dossier</div>
              <div className="menu-item" onClick={handleCreateNote}>+ Note</div>
              <div className="menu-divider" style={{ height: 1, background: '#444', margin: '4px 0' }}></div>
            </>
          )}
          <div className="menu-item" onClick={handleRename}>Renommer</div>
          <div className="menu-item delete" onClick={handleDelete} style={{ color: '#ff4444' }}>Supprimer</div>
        </div>
      )}
    </div>
  );
};