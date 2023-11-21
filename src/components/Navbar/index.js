import styles from "./navbar.module.css";
import { NavLink, useLocation } from "react-router-dom";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { navData } from "../../lib/navData";
import { useState } from "react";
import logoG from "../../assets/images/logoG.png";
import { Fragment } from "react";

export default function Navbar() {
  const [open, setopen] = useState(true);
  const toggleOpen = () => {
    setopen(!open);
  };

  let path = useLocation();
  if (path.pathname === "/log-in" || path.pathname === "/sign-out") {
    return null;
  }

  return (
    <div className={open ? styles.sidenav : styles.sidenavClosed}>
      <li style={{ listStyleType: "none" }}>
        <div className="h-24 pb-4">
          <img
            src={logoG}
            style={{
              objectFit: "contain",
              width: "auto",
              height: "100%",
              paddingLeft: 6,
            }}
            alt="GuardisAI logo"
          />
        </div>
      </li>

      <button className={styles.menuBtn} onClick={toggleOpen}>
        {open ? (
          <KeyboardDoubleArrowLeftIcon />
        ) : (
          <KeyboardDoubleArrowRightIcon />
        )}
      </button>
      {navData.map((item, i) => {
        if (i === navData.length - 1)
          return (
            <Fragment key={item.id}>
              <div className="grow" />
              <NavLink
                key={item.id}
                className={
                  styles.sideitem +
                  (item.text === window.location.href ? "active" : "")
                }
                to={item.link}
              >
                {item.icon}
                <span className={styles.linkText}>{item.text}</span>
              </NavLink>
            </Fragment>
          );
        return (
          <NavLink
            key={item.id}
            className={
              styles.sideitem +
              (item.text === window.location.href ? "active" : "")
            }
            to={item.link}
          >
            {item.icon}
            <span className={styles.linkText}>{item.text}</span>
          </NavLink>
        );
      })}
    </div>
  );
}
