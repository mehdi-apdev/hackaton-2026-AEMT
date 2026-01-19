import { Link, useLocation } from "react-router-dom";
import "./left-sidebar.css";
import classNames from "classnames";
import { Fragment } from "react/jsx-runtime";

type LeftSidebarProps = {
  isLeftSidebarCollapsed: boolean;
  changeIsLeftSidebarCollapsed: (isLeftSidebarCollapsed: boolean) => void;
};

const LeftSidebar = ({
  isLeftSidebarCollapsed,
  changeIsLeftSidebarCollapsed,
}: LeftSidebarProps) => {
  const location = useLocation();

  const items = [
    {
      routerLink: "/",
      icon: "fal fa-home",
      label: "Accueil",
    },
    {
      routerLink: "/ping",
      icon: "fal fa-network-wired",
      label: "Ping Test",
    },
  ];

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
            <div className="logo-text">Hackaton</div>
            <button className="btn-close" onClick={closeSidenav}>
              <i className="fal fa-times close-icon"></i>
            </button>
          </Fragment>
        )}
      </div>
      <div className="sidenav-nav">
        {items.map((item) => {
             const isActive = location.pathname === item.routerLink || (item.routerLink !== "/" && location.pathname.startsWith(item.routerLink));
             return (
              <li key={item.label} className="sidenav-nav-item">
                <Link 
                  className={classNames("sidenav-nav-link", { active: isActive })} 
                  to={item.routerLink}
                >
                  <i
                    className={classNames({
                      "sidenav-link-icon": true,
                      [item.icon]: true,
                    })}
                  ></i>
                  {!isLeftSidebarCollapsed && (
                    <span className="sidenav-link-text">{item.label}</span>
                  )}
                </Link>
              </li>
            );
        })}
      </div>
    </div>
  );
};

export default LeftSidebar;