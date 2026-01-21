import { useState, type MouseEvent, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./FolderTree.css";
import type { Folder } from "../models/Folder";
import type { Note } from "../models/Note";
import FolderService from "../services/FolderService";
import NoteService from "../services/NoteService";
import { faFileCirclePlus, faFolderPlus, faTrash, faFileAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Modal } from "../../../shared/components/Modal";

interface FolderTreeProps {
  folder: Folder;
  onRefresh: () => void;
}

type ModalType = "SUBFOLDER" | "NOTE" | null;

export const FolderTree = ({ folder, onRefresh }: FolderTreeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { id: activeNoteId } = useParams();

// --- Modal Management ---
  const [modalType, setModalType] = useState<ModalType>(null);
  const [itemName, setItemName] = useState("");

  const closeModal = () => {
    setModalType(null);
    setItemName("");
  };

  const toggleOpen = (event: MouseEvent) => {
    event.stopPropagation();
    setIsOpen(!isOpen);
  };

  // --- Actions ---
  const handleCreateSubFolderClick = (event: MouseEvent) => {
    event.stopPropagation();
    setModalType("SUBFOLDER");
    setIsOpen(true); // Open the parent folder to see the result.
  };

  const handleCreateNoteClick = (event: MouseEvent) => {
    event.stopPropagation();
    setModalType("NOTE");
    setIsOpen(true);
  };

  const handleModalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    try {
      if (modalType === "SUBFOLDER") {
        await FolderService.createFolder(itemName, folder.id);
      } else if (modalType === "NOTE") {
        const newNote = await NoteService.createNote(itemName, folder.id);
        navigate(`/note/${newNote.id}`);
      }
      onRefresh();
      closeModal();
    } catch (error) {
      alert("Erreur lors de la création.");
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
            <FolderTree key={childFolder.id} folder={childFolder} onRefresh={onRefresh} />
          ))}

          {folder.notes?.map((note: Note) => (
            <div key={note.id} className={`note-item ${String(activeNoteId) === String(note.id) ? "active" : ""}`} onClick={(event) => handleNoteClick(note.id, event)}>
              <span className="note-icon"><FontAwesomeIcon icon={faFileAlt} /></span>
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

      {/* --- MODALE --- */}
      <Modal 
        isOpen={!!modalType} 
        onClose={closeModal} 
        title={modalType === "SUBFOLDER" ? "Nouveau Sous-Dossier" : "Nouvelle Note"}
      >
        <form onSubmit={handleModalSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="itemName" 
              style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}
            >
              {modalType === "SUBFOLDER" ? "Nom du dossier" : "Titre de la note"}
            </label>
            <input
              id="itemName"
              type="text"
              autoFocus
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="..."
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(0,0,0,0.5)',
                border: '1px solid #ff6600',
                borderRadius: '8px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>

          <div className="modal-footer">
            <button type="button" onClick={closeModal} className="btn-modal-cancel">
              Annuler
            </button>
            <button type="submit" className="btn-modal-confirm">
              Créer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
