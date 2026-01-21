import { Fragment, useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import "./sidebar.css";
import { FolderTree } from "../../../features/notes/components/FolderTree";
import FolderService from "../../../features/notes/services/FolderService";
import type { Folder } from "../../../features/notes/models/Folder";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router";

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

  const sidebarClasses = classNames({
    sidenav: true,
    "sidenav-collapsed": isLeftSidebarCollapsed,
  });

  const closeSidenav = () => changeIsLeftSidebarCollapsed(true);
  const toggleCollapse = () => changeIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);

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

  const handleAddRootFolder = async () => {
    const name = prompt("Nom du nouveau grimoire :");
    if (!name) return;
    try {
      await FolderService.createFolder(name, null);
      refreshTree();
    } catch (error) {
      alert("Erreur lors de la creation du grimoire.");
    }
  };

  return (
    <div className={sidebarClasses}>
      <div className="logo-container">
        {!isLeftSidebarCollapsed && (
          <Fragment>
            {/* <div className="logo-text" onClick={}>Spooky Notes</div> */}
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
            <button onClick={handleAddRootFolder} className="btn-add-root">
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
  );
};

export default LeftSidebar;
