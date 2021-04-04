import React from "react";

import { Link } from "gatsby";
import {
  header,
  header__wrap,
  header__heading,
  header__nav,
  header__link,
  header__linkHome,
} from "./header.module.css";

const Header = () => (
  <header className={header}>
    <div className={header__wrap}>
      <h1 className={header__heading}>
        <Link to="/" className={`${header__link} ${header__linkHome}`}>
          TaskMaster
        </Link>
      </h1>
      <nav role="main" className={header__nav}>
        <Link to="/app/tasks" className={header__link}>
          Tasks
        </Link>
        <Link to="/app/orchestrations" className={header__link}>
          Orchestrations
        </Link>
        <Link to="/app/profile" className={header__link}>
          Profile
        </Link>
      </nav>
    </div>
  </header>
);

export default Header;
