import React from "react";

import { Router } from "@reach/router";
import Layout from "../components/Layout";
import Tasks from "../components/Tasks";
import TaskPage from "../components/TaskPage";
import TaskScheduler from "../components/TaskScheduler";
import Profile from "../components/Profile";
import Login from "../components/Login";
import PrivateRoute from "../components/PrivateRoute";
import Status from "../components/Status";

const App = () => (
  <Layout>
    <Status />
    <Router>
      <PrivateRoute path="/app/task/:taskID" component={TaskPage} />
      <PrivateRoute path="/app/tasks/schedule" component={TaskScheduler} />
      <PrivateRoute path="/app/tasks" component={Tasks} />
      <PrivateRoute path="/app/profile" component={Profile} />
      <Login path="/app/login" />
    </Router>
  </Layout>
);

export default App;
