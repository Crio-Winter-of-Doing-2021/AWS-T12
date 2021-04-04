import React from "react";

import { Link } from "@reach/router";
import { isAuthenticated, getProfile, logout } from "../../services/auth";
import { status, status__text } from "./status.module.css";

export default () => {
  let details;
  if (!isAuthenticated()) {
    details = (
      <p className={status__text}>
        To get the full TaskMaster experience, you’ll need to
        {` `}
        <Link to="/app/login">log in</Link>.
      </p>
    );
  } else {
    const currentUser = getProfile();

    if ("email" in currentUser) {
      const { name, email } = currentUser;

      details = (
        <p className={status__text}>
          Logged in as {name} ({email}
          )!
          {` `}
          <a
            href="/"
            onClick={(event) => {
              event.preventDefault();
              logout();
            }}
          >
            log out
          </a>
        </p>
      );
    } else {
      logout();
    }
  }

  return <div className={status}>{details}</div>;
};
