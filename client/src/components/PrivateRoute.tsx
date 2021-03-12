import React, { Component } from "react";

import PropTypes from "prop-types";
import { navigate } from "gatsby";
import { isLoggedIn } from "../services/auth";

type PrivateRouteProps = {
  component: Component;
};

const PrivateRoute = ({ component, ...rest }: PrivateRouteProps) => {
  if (!isLoggedIn() && window.location.pathname !== `/app/login`) {
    // If we’re not logged in, redirect to the home page.
    navigate(`/app/login`);
    return null;
  }

  return <Component {...rest} />;
};

PrivateRoute.propTypes = {
  component: PropTypes.any.isRequired,
};

export default PrivateRoute;
