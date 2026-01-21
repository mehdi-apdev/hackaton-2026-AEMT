import { Fragment, useCallback, useEffect, useState, type FormEvent } from "react";
import classNames from "classnames";
import "./sidebar.css";
import { FolderTree } from "../../../features/notes/components/FolderTree";
import FolderService from "../../../features/notes/services/FolderService";
import type { Folder } from "../../../features/notes/models/Folder";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router";
import { Modal } from "../../../shared/components/Modal";

type LeftSidebarProps = {
  isLeftSidebarCollapsed: boolean;
  changeIsLeftSidebarCollapsed: (isLeftSidebarCollapsed: boolean) => void;
};

const LeftSidebar = ({
  isLeftSidebarCollapsed,
  changeIsLeftSidebarCollapsed,
}: LeftSidebarProps) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // États pour la modale
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const sidebarClasses = classNames({
    sidenav: true,
    "sidenav-collapsed": isLeftSidebarCollapsed,
  });

  const closeSidenav = () => changeIsLeftSidebarCollapsed(true);
  
  const refreshTree = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const treeData = await FolderService.getTree();
      setFolders(treeData);
    } catch (error) {
      setErrorMessage("Impossible de charger les dossiers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTree();
  }, [refreshTree]);

  // Ouvrir la modale
  const handleOpenModal = () => {
    setNewFolderName("");
    setIsModalOpen(true);
  };

  // Soumission du formulaire de création
  const handleSubmitFolder = async (e: FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      await FolderService.createFolder(newFolderName, null);
      refreshTree();
      setIsModalOpen(false); // Fermer la modale
    } catch (error) {
      alert("Erreur lors de la creation du grimoire.");
    }
  };

  return (
    <>
      <div className={sidebarClasses}>
        <div className="logo-container">
          {!isLeftSidebarCollapsed && (
            <Fragment>
              <Link to="/" className="logo-text">Spooky Notes</Link>
              <button className="icon-btn close-btn" onClick={closeSidenav} title="Fermer">
                <FontAwesomeIcon icon={faTimes} />  
              </button>
            </Fragment>
          )}
        </div>

        <div className="sidenav-nav">
          {!isLeftSidebarCollapsed && (
            <div className="sidebar-actions">
              <button onClick={handleOpenModal} className="btn-add-root">
                <FontAwesomeIcon icon={faPlus}  />  Nouveau grimoire
              </button>
            </div>
          )}

          {isLoading ? (
            <div className="loading-text">Chargement des dossiers...</div>
          ) : errorMessage ? (
            <div className="error-text">{errorMessage}</div>
          ) : (
            !isLeftSidebarCollapsed && (
              <div className="folders-list">
                {folders.map((folder: Folder) => (
                  <FolderTree key={folder.id} folder={folder} onRefresh={refreshTree} />
                ))}
              </div>
            )
          )}
        </div>
      </div>

      {/* --- MODALE DE CRÉATION --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Nouveau Grimoire"
      >
        <form onSubmit={handleSubmitFolder}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="folderName" 
              style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}
            >
              Nom du grimoire
            </label>
            <input
              id="folderName"
              type="text"
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Ex: Sortilèges interdits..."
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
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn-modal-cancel">
              Annuler
            </button>
            <button type="submit" className="btn-modal-confirm">
              Créer
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default LeftSidebar;
