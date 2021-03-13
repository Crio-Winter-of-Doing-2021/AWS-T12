import React, { Component, ChangeEvent, FormEvent } from "react";

import { RouteComponentProps } from "@reach/router";
import { navigate } from "gatsby";
import Form from "./Form";
import View from "./View";
import { handleLogin, isLoggedIn } from "../services/auth";

type LoginState = { username: string; password: string };

class Login extends Component<RouteComponentProps, LoginState> {
  constructor(props: RouteComponentProps) {
    super(props);

    this.state = {
      username: ``,
      password: ``,
    };
  }

  handleUpdate(event: ChangeEvent<HTMLInputElement>) {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value,
    });
  }

  handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    handleLogin({
      username: this.state.username,
      password: this.state.password,
    });
  }

  render() {
    if (isLoggedIn()) {
      navigate(`/app/tasks`);
    }

    return (
      <View title="Log In">
        <Form
          handleUpdate={(e) => this.handleUpdate(e)}
          handleSubmit={(e) => this.handleSubmit(e)}
        />
      </View>
    );
  }
}

export default Login;
