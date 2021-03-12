import React, { ReactNode } from "react";
import PropTypes from "prop-types";
import { view } from "./view.module.css";

type ViewProps = {
  children: ReactNode[];
  title: string;
};

const View = ({ title, children }: ViewProps) => (
  <section className={view}>
    <h1>{title}</h1>
    {children}
  </section>
);

View.propTypes = {
  title: PropTypes.string.isRequired,
};

export default View;
