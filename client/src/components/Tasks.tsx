import React from "react";
import View from "./View";
import { getProfile } from "../services/auth";

const Tasks = () => {
  const currentUser = getProfile();

  if (!("email" in currentUser)) {
    return null;
  }

  const { name } = currentUser;

  return (
    <View title="Tasks">
      <p>Welcome to your tasks, {name}!</p>
      <p>
        This is a client-only route. You could set up a form to save information
        about a user here.
      </p>
    </View>
  );
};

export default Tasks;
