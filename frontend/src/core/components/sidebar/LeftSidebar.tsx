import { useEffect, useState } from 'react';
import "./sidebar.css";
import classNames from "classnames";
import { Fragment } from "react/jsx-runtime";
import { FolderTree } from '../../../features/notes/components/FolderTree';
import FolderService from '../../../features/notes/services/FolderService';
import type { Folder } from '../../../features/notes/models/Folder';

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

  // --- 1. Gestion des classes CSS (existante) ---
  const sidebarClasses = classNames({
    sidenav: true,
    "sidenav-collapsed": isLeftSidebarCollapsed,
  });

  const closeSidenav = () => {
    changeIsLeftSidebarCollapsed(true);
  };

  const toggleCollapse = (): void => {
    changeIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  };

  // --- 2. Logique de Données (Nouvelle) ---

  // Fonction pour recharger l'arbre depuis le Backend
  const refreshTree = async () => {
    try {
      const treeData = await FolderService.getTree();
      setFolders(treeData);
    } catch (error) {
      console.error("Erreur chargement arbre:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    refreshTree();
  }, []);

  // Création d'un dossier racine (sans parent)
  const handleAddRootFolder = async () => {
    const name = prompt("🎃 Nom du nouveau Grimoire (Dossier Racine) :");
    if (name) {
      try {
        await FolderService.createFolder(name, null); // null = racine
        refreshTree(); // On rafraîchit l'affichage
      } catch (error) {
        alert("Erreur lors de la création du grimoire.");
      }
    }
  };

  return (
    <div className={sidebarClasses}>
      {/* HEADER : Logo + Titre */}
      <div className="logo-container">
        <button className="logo" onClick={toggleCollapse}>
          <i className="fal fa-bars"></i>
        </button>
        {!isLeftSidebarCollapsed && (
          <Fragment>
            <div className="logo-text">Spooky Notes</div>
            <button className="btn-close" onClick={closeSidenav}>
              <i className="fal fa-times close-icon"></i>
            </button>
          </Fragment>
        )}
      </div>

      {/* BODY : Arbre des dossiers */}
      <div className="sidenav-nav" style={{ overflowY: 'auto', flex: 1 }}>
        {isLoading ? (
          <div style={{ padding: '20px', color: '#888' }}>Chargement...</div>
        ) : !isLeftSidebarCollapsed && (
          <>
            {/* Liste des dossiers existants */}
            {folders.map((folder: Folder) => (
              <FolderTree 
                key={folder.id} 
                folder={folder} 
                onRefresh={refreshTree} // Important : pour que les enfants puissent trigger le refresh
              />
            ))}

            {/* Bouton d'ajout Racine (Toujours visible en bas de liste ou si vide) */}
            <div style={{ padding: '10px 20px', marginTop: '10px', borderTop: '1px solid #444' }}>
              <button 
                onClick={handleAddRootFolder}
                className="btn-add-root"
                style={{
                  background: 'transparent',
                  border: '1px dashed #ff6600',
                  color: '#ff6600',
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                + Nouveau Grimoire
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;