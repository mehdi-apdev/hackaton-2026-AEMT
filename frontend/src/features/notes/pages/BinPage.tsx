import { useEffect, useState } from "react";
import BinService from "../services/BinService";
import type { Note } from "../models/Note";
import type { Folder } from "../models/Folder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTrash, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useModal } from "../../../shared/context/ModalContext";
import "./BinPage.css";

export default function BinPage() {
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [deletedFolders, setDeletedFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { openConfirmModal } = useModal();

  const loadBin = async () => {
    setIsLoading(true);
    try {
      const notes = await BinService.getDeletedNotes();
      const folders = await BinService.getDeletedFolders();
      setDeletedNotes(notes);
      setDeletedFolders(folders);
    } catch (error) {
      console.error("Erreur lors du chargement des éléments supprimés", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBin();
  }, []);

  const handleRestoreNote = async (id: number) => {
    await BinService.restoreNote(id);
    loadBin();
    window.dispatchEvent(new CustomEvent("notes:refresh"));
  };

  const handlePermanentDeleteNote = (id: number) => {
    openConfirmModal(
      "Suppression Définitive",
      "Voulez-vous vraiment supprimer cette note à jamais ?",
      async () => {
        await BinService.permanentDeleteNote(id);
        loadBin();
      }
    );
  };

  const handleRestoreFolder = async (id: number) => {
    await BinService.restoreFolder(id);
    loadBin();
    window.dispatchEvent(new CustomEvent("notes:refresh"));
  };

  const handlePermanentDeleteFolder = (id: number) => {
    openConfirmModal(
      "Suppression Définitive",
      "Voulez-vous vraiment supprimer ce dossier et tous ses secrets à jamais ?",
      async () => {
        await BinService.permanentDeleteFolder(id);
        loadBin();
      }
    );
  };

  return (
    <div className="bin-page">
      <div className="bin-header">
        <button onClick={() => navigate(-1)} className="btn-back">
          <FontAwesomeIcon icon={faArrowLeft} /> Retourner à la surface
        </button>
        <h1>Vos éléments supprimés</h1>
      </div>

      
      {isLoading ? (<p className="empty-msg">Appel des éléments supprimés...</p>) : (
        <div className="bin-content">
          <section>
            <h2>Vestiges des notes</h2>
            {deletedNotes.length === 0 ? (
              <p className="empty-msg">Il n'y a rien à voir ici.</p>
            ) : (
              <ul className="bin-list">
                {deletedNotes.map((note) => (
                  <li key={note.id} className="bin-item">
                    <span>{note.title}</span>
                    <div className="bin-actions">
                      <button onClick={() => handleRestoreNote(note.id!)} title="Restaurer">
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                      </button>
                      <button onClick={() => handlePermanentDeleteNote(note.id!)} className="btn-delete" title="Supprimer définitivement">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2>Vestiges des dossiers</h2>
            {deletedFolders.length === 0 ? (
              <p className="empty-msg">Aucun vestige à contempler.</p>
            ) : (
              <ul className="bin-list">
                {deletedFolders.map((folder) => (
                  <li key={folder.id} className="bin-item">
                    <span>{folder.name}</span>
                    <div className="bin-actions">
                      <button onClick={() => handleRestoreFolder(folder.id)} title="Restaurer">
                        <FontAwesomeIcon icon={faClockRotateLeft} />
                      </button>
                      <button onClick={() => handlePermanentDeleteFolder(folder.id)} className="btn-delete" title="Supprimer définitivement">
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
