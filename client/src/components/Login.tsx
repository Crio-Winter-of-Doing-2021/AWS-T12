import React from "react";

import { navigate } from "gatsby";
import { login, isAuthenticated } from "../services/auth";
import View from "./View";

const Login = () => {
  if (!isAuthenticated()) {
    login();

    return <View title="Redirecting to Auth0 site..." />;
  }

  navigate("/app/tasks");
  return null;
};

export default Login;
