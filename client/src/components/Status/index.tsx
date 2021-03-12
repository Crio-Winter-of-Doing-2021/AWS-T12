import React from "react";

import { Link, navigate } from "@reach/router";
import { getCurrentUser, isLoggedIn, logout } from "../../services/auth";
import { status, status__text } from "./status.module.css";

export default () => {
  let details;
  if (!isLoggedIn()) {
    details = (
      <p className={status__text}>
        To get the full TaskMaster experience, you’ll need to
        {` `}
        <Link to="/app/login">log in</Link>.
      </p>
    );
  } else {
    const currentUser = getCurrentUser();

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
              logout(() => navigate(`/app/login`));
            }}
          >
            log out
          </a>
        </p>
      );
    }
  }

  return <div className={status}>{details}</div>;
};
