import { useEffect, useState, type MouseEvent } from "react";
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

export const FolderTree = ({
  folder,
  openFolderIds,
  onToggle,
  onOpen,
  onRefresh,
}: FolderTreeProps) => {
  const isOpen = openFolderIds.has(folder.id);
  const navigate = useNavigate();
  const { id: activeNoteId } = useParams();
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);

  const toggleOpen = (event: MouseEvent) => {
    event.stopPropagation();
    onToggle(folder.id);
  };

  const handleCreateSubFolder = async (event: MouseEvent) => {
    event.stopPropagation();
    const name = prompt("Nom du sous-dossier :");
    if (!name) return;
    try {
      await FolderService.createFolder(name, folder.id);
      onOpen(folder.id);
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
      onOpen(folder.id);
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

  const handleContextMenu = (
    event: MouseEvent,
    type: "folder" | "note",
    id: number,
    name: string
  ) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      type,
      id,
      name,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleRename = async () => {
    if (!contextMenu) return;
    const nextName = prompt("Nouveau nom :", contextMenu.name);
    if (!nextName || nextName === contextMenu.name) {
      setContextMenu(null);
      return;
    }
    try {
      if (contextMenu.type === "folder") {
        await FolderService.renameFolder(contextMenu.id, nextName);
      } else {
        const note = await NoteService.getNoteById(contextMenu.id);
        const safeContent = note.content ?? "";
        await NoteService.updateNote(contextMenu.id, nextName, safeContent);
        window.dispatchEvent(
          new CustomEvent("note:renamed", {
            detail: { id: contextMenu.id, title: nextName },
          })
        );
      }
      onRefresh();
    } catch (error) {
      alert("Impossible de renommer.");
    } finally {
      setContextMenu(null);
    }
  };

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
          <button onClick={handleDeleteFolder} title="Supprimer le dossier" className="btn-icon btn-delete">
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
                <FontAwesomeIcon icon={faFileCirclePlus} />
              </span>
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

      {contextMenu ? (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <button type="button" className="context-menu-item" onClick={handleRename}>
            Renommer
          </button>
        </div>
      ) : null}
    </div>
  );
};
