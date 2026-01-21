import { useEffect, useState, type MouseEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FolderTree.css";
import type { Folder } from "../models/Folder";
import type { Note } from "../models/Note";
import FolderService from "../services/FolderService";
import NoteService from "../services/NoteService";
import { faFileAlt, faFileCirclePlus, faFolderPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "../../../shared/components/Modal";

interface FolderTreeProps {
  folder: Folder;
  openFolderIds: Set<number>;
  onToggle: (folderId: number) => void;
  onOpen: (folderId: number) => void;
  onRefresh: () => void;
}

type ModalType = "SUBFOLDER" | "NOTE" | null;

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

  const [modalType, setModalType] = useState<ModalType>(null);
  const [itemName, setItemName] = useState("");

  const closeModal = () => {
    setModalType(null);
    setItemName("");
  };

  const toggleOpen = (event: MouseEvent) => {
    event.stopPropagation();
    onToggle(folder.id);
  };

  const handleCreateSubFolderClick = (event: MouseEvent) => {
    event.stopPropagation();
    onOpen(folder.id);
    setModalType("SUBFOLDER");
  };

  const handleCreateNoteClick = (event: MouseEvent) => {
    event.stopPropagation();
    onOpen(folder.id);
    setModalType("NOTE");
  };

  const handleModalSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const name = itemName.trim();
    if (!name) return;

    try {
      if (modalType === "SUBFOLDER") {
        await FolderService.createFolder(name, folder.id);
        onOpen(folder.id);
      } else if (modalType === "NOTE") {
        const newNote = await NoteService.createNote(name, folder.id);
        onOpen(folder.id);
        navigate(`/note/${newNote.id}`);
      }
      onRefresh();
      closeModal();
    } catch (error) {
      alert("Erreur lors de la creation.");
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

  const handleContextMenu = (event: MouseEvent, type: "folder" | "note", id: number, name: string) => {
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
          <button onClick={handleCreateSubFolderClick} title="Nouveau dossier" className="btn-icon">
            <FontAwesomeIcon icon={faFolderPlus} />
          </button>
          <button onClick={handleCreateNoteClick} title="Nouvelle note" className="btn-icon">
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
                <FontAwesomeIcon icon={faFileAlt} />
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

      <Modal
        isOpen={!!modalType}
        onClose={closeModal}
        title={modalType === "SUBFOLDER" ? "Nouveau Sous-Dossier" : "Nouvelle Note"}
      >
        <form onSubmit={handleModalSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label htmlFor="itemName" style={{ display: "block", marginBottom: "0.5rem", color: "#ccc" }}>
              {modalType === "SUBFOLDER" ? "Nom du dossier" : "Titre de la note"}
            </label>
            <input
              id="itemName"
              type="text"
              autoFocus
              value={itemName}
              onChange={(event) => setItemName(event.target.value)}
              placeholder="..."
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(0,0,0,0.5)",
                border: "1px solid #ff6600",
                borderRadius: "8px",
                color: "white",
                outline: "none",
              }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={closeModal} className="btn-modal-cancel">
              Annuler
            </button>
            <button type="submit" className="btn-modal-confirm">
              Creer
            </button>
          </div>
        </form>
      </Modal>

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
