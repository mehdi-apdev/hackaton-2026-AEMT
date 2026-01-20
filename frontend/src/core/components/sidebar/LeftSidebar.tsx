import { Fragment, useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import "./sidebar.css";
import { FolderTree } from "../../../features/notes/components/FolderTree";
import FolderService from "../../../features/notes/services/FolderService";
import type { Folder } from "../../../features/notes/models/Folder";
import { useAuth } from "../../../features/auth/context/AuthContext";

type LeftSidebarProps = {
  isLeftSidebarCollapsed: boolean;
  changeIsLeftSidebarCollapsed: (isLeftSidebarCollapsed: boolean) => void;
};

const LeftSidebar = ({
  isLeftSidebarCollapsed,
  changeIsLeftSidebarCollapsed,
}: LeftSidebarProps) => {
  const { isAuthenticated } = useAuth();
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

  useEffect(() => {
    if (isAuthenticated) return;
    setFolders([]);
    setErrorMessage(null);
    setIsLoading(false);
  }, [isAuthenticated]);

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
        <button className="icon-btn logo-btn" onClick={toggleCollapse} title="Menu">
          [=]
        </button>

        {!isLeftSidebarCollapsed && (
          <Fragment>
            <div className="logo-text">Spooky Notes</div>
            <button className="icon-btn close-btn" onClick={closeSidenav} title="Fermer">
              [x]
            </button>
          </Fragment>
        )}
      </div>

      <div className="sidenav-nav">
        {!isLeftSidebarCollapsed && (
          <div className="sidebar-actions">
            <button onClick={handleAddRootFolder} className="btn-add-root">
              + Nouveau grimoire
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
