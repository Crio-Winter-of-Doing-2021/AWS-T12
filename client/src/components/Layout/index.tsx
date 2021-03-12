import React, { ReactNode } from "react";
import { Helmet } from "react-helmet";

import Header from "../Header";

type LayoutProps = {
  children: ReactNode[];
};

// Global styles and component-specific styles.
import "./global.css";
import { main } from "./main.module.css";

const Layout = ({ children }: LayoutProps) => (
  <div>
    <Helmet title="TaskMaster" />
    <Header />
    <main className={main}>{children}</main>
  </div>
);

export default Layout;
