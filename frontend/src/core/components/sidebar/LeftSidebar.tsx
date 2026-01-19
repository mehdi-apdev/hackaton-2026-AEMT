import "./sidebar.css";
import classNames from "classnames";
import { Fragment } from "react/jsx-runtime";
import { FolderTree } from '../../../features/notes/components/FolderTree';
import { MOCK_FOLDERS } from '../../../features/notes/mockData';
import type { Folder } from '../../../features/notes/models/Folder';


type LeftSidebarProps = {
  isLeftSidebarCollapsed: boolean;
  changeIsLeftSidebarCollapsed: (isLeftSidebarCollapsed: boolean) => void;
};

const LeftSidebar = ({
  isLeftSidebarCollapsed,
  changeIsLeftSidebarCollapsed,
}: LeftSidebarProps) => {

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

  return (
    <div className={sidebarClasses}>
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
        <div className="sidenav-nav" style={{ overflowY: 'auto', height: 'calc(100% - 70px)' /* Ajuster la hauteur si nécessaire */ }}>
            {!isLeftSidebarCollapsed && MOCK_FOLDERS.map((folder: Folder) => (
                <FolderTree key={folder.id} folder={folder} />
            ))}
      </div>
    </div>
  );
};

export default LeftSidebar;
