import React, { ChangeEvent, FormEvent } from "react";
import {
  form,
  form__label,
  form__input,
  form__button,
} from "./form.module.css";
import { navigate } from "@reach/router";

type FormProps = {
  handleSubmit: (_: FormEvent<HTMLFormElement>) => void;
  handleUpdate: (_: ChangeEvent<HTMLInputElement>) => void;
};

const Form = ({ handleSubmit, handleUpdate }: FormProps) => (
  <form
    className={form}
    method="post"
    onSubmit={(event) => {
      handleSubmit(event);
      navigate(`/app/profile`);
    }}
  >
    <p>
      Currently auth is faked. Please log in with the username{" "}
      <code>aws-t12</code> and the password <code>change-it</code>.
    </p>
    <label className={form__label}>
      Username
      <input
        className={form__input}
        type="text"
        name="username"
        onChange={handleUpdate}
      />
    </label>
    <label className={form__label}>
      Password
      <input
        className={form__input}
        type="password"
        name="password"
        onChange={handleUpdate}
      />
    </label>
    <input className={form__button} type="submit" value="Log In" />
  </form>
);

export default Form;
