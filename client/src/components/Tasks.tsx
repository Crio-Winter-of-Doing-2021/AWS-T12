import React, { useEffect } from "react";
import View from "./View";
import { getProfile } from "../services/auth";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error(
    ".env is missing the definition of an API_URL environment variable"
  );
}

const Tasks = () => {
  const currentUser = getProfile();

  if (!("email" in currentUser)) {
    return null;
  }

  const { name } = currentUser;

  const loadTasks = async () => {
    try {
      const jsonResponse = await fetch(API_URL + `/tasks`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      const response = await jsonResponse.json();

      if (response.error) {
        console.log(response.error);
        return;
      }

      console.log(response);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

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
