import "@fontsource/indie-flower";

import React, { Component } from "react";
import { silentAuth } from "./src/services/auth";

class SessionCheck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  handleCheckSession = () => {
    this.setState({ loading: false });
  };

  componentDidMount() {
    silentAuth(this.handleCheckSession);
  }

  render() {
    return (
      this.state.loading === false && (
        <React.Fragment>{this.props.children}</React.Fragment>
      )
    );
  }
}

export const wrapRootElement = ({ element }) => {
  return <SessionCheck>{element}</SessionCheck>;
};
