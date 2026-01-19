import { useEffect, useState, Fragment } from 'react';
import classNames from "classnames";
import "./sidebar.css";
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

  const sidebarClasses = classNames({
    sidenav: true,
    "sidenav-collapsed": isLeftSidebarCollapsed,
  });

  const closeSidenav = () => changeIsLeftSidebarCollapsed(true);
  const toggleCollapse = () => changeIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);

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

  useEffect(() => {
    refreshTree();
  }, []);

  const handleAddRootFolder = async () => {
    const name = prompt("🎃 Nom du nouveau Grimoire (Dossier Racine) :");
    if (name) {
      try {
        await FolderService.createFolder(name, null);
        refreshTree();
      } catch (error) {
        alert("Erreur lors de la création du grimoire.");
      }
    }
  };

  return (
    <div className={sidebarClasses}>
      {/* HEADER : Logo + Titre */}
      <div className="logo-container">
        <button className="icon-btn logo-btn" onClick={toggleCollapse} title="Menu">
            🕸️
        </button>
        
        {!isLeftSidebarCollapsed && (
          <Fragment>
            <div className="logo-text">Spooky Notes</div>
            <button className="icon-btn close-btn" onClick={closeSidenav} title="Fermer">
              ❌
            </button>
          </Fragment>
        )}
      </div>

      {/* BODY : Actions + Arbre */}
      <div className="sidenav-nav">
        
        {/* --- CHANGEMENT : Le bouton est maintenant ICI (en haut) --- */}
        {!isLeftSidebarCollapsed && (
          <div className="sidebar-actions">
            <button onClick={handleAddRootFolder} className="btn-add-root">
              + Nouveau Grimoire 🦇
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="loading-text">Invocation des dossiers... 🕯️</div>
        ) : !isLeftSidebarCollapsed && (
          <div className="folders-list">
            {folders.map((folder: Folder) => (
              <FolderTree 
                key={folder.id} 
                folder={folder} 
                onRefresh={refreshTree} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;