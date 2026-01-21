import { Fragment, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import classNames from "classnames";
import "./sidebar.css";
import { FolderTree } from "../../../features/notes/components/FolderTree";
import FolderService from "../../../features/notes/services/FolderService";
import type { Folder } from "../../../features/notes/models/Folder";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTimes } from "@fortawesome/free-solid-svg-icons";

type LeftSidebarProps = {
  isLeftSidebarCollapsed: boolean;
  changeIsLeftSidebarCollapsed: (isLeftSidebarCollapsed: boolean) => void;
};

const LeftSidebar = ({
  isLeftSidebarCollapsed,
  changeIsLeftSidebarCollapsed,
}: LeftSidebarProps) => {
  const { id: activeNoteId } = useParams();
  const [folders, setFolders] = useState<Folder[]>([]);
  const [openFolderIds, setOpenFolderIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

      setOpenFolderIds((prev) => {
        const existing = new Set<number>();
        const collect = (nodes: Folder[]) => {
          nodes.forEach((node) => {
            existing.add(node.id);
            if (node.children?.length) collect(node.children);
          });
        };
        collect(treeData);

        const next = new Set<number>();
        prev.forEach((id) => {
          if (existing.has(id)) next.add(id);
        });

        if (activeNoteId) {
          const noteId = Number(activeNoteId);
          const path = findNotePath(treeData, noteId);
          path.forEach((id) => next.add(id));
        }

        return next;
      });
    } catch (error) {
      setErrorMessage("Impossible de charger les dossiers.");
    } finally {
      setIsLoading(false);
    }
  }, [activeNoteId]);

  useEffect(() => {
    void refreshTree();
  }, [refreshTree]);

  useEffect(() => {
    const handleRefresh = () => {
      void refreshTree();
    };

    window.addEventListener("notes:refresh", handleRefresh);
    return () => {
      window.removeEventListener("notes:refresh", handleRefresh);
    };
  }, [refreshTree]);

  useEffect(() => {
    if (!activeNoteId) return;
    const noteId = Number(activeNoteId);
    if (!Number.isFinite(noteId)) return;
    const path = findNotePath(folders, noteId);
    if (!path.length) return;
    setOpenFolderIds((prev) => {
      const next = new Set(prev);
      path.forEach((id) => next.add(id));
      return next;
    });
  }, [activeNoteId, folders]);

  const toggleFolder = useCallback((folderId: number) => {
    setOpenFolderIds((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const openFolder = useCallback((folderId: number) => {
    setOpenFolderIds((prev) => {
      if (prev.has(folderId)) return prev;
      const next = new Set(prev);
      next.add(folderId);
      return next;
    });
  }, []);

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
            <div className="logo-text">Spooky Notes</div>
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
              <FontAwesomeIcon icon={faPlus} /> Nouveau grimoire
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
                <FolderTree
                  key={folder.id}
                  folder={folder}
                  openFolderIds={openFolderIds}
                  onToggle={toggleFolder}
                  onOpen={openFolder}
                  onRefresh={refreshTree}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;

const findNotePath = (folders: Folder[], noteId: number): number[] => {
  for (const folder of folders) {
    if (folder.notes?.some((note) => note.id === noteId)) {
      return [folder.id];
    }
    if (folder.children?.length) {
      const childPath = findNotePath(folder.children, noteId);
      if (childPath.length) {
        return [folder.id, ...childPath];
      }
    }
  }
  return [];
};
