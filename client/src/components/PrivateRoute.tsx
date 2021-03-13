import React, { ElementType } from "react";

import PropTypes from "prop-types";
import View from "./View";
import { Link } from "gatsby";
import { isAuthenticated } from "../services/auth";

type PrivateRouteProps = {
  component: ElementType;
};

const PrivateRoute = ({ component: Component, ...rest }: PrivateRouteProps) => {
  if (!isAuthenticated()) {
    return (
      <View title="Not logged in!">
        <p>
          You have to <Link to="/app/login">login</Link> to proceed.
        </p>
      </View>
    );
  }

  return <Component {...rest} />;
};

PrivateRoute.propTypes = {
  component: PropTypes.any.isRequired,
};

export default PrivateRoute;
