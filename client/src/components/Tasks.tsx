import React, { useEffect, useReducer } from "react";
import View from "./View";
import { getProfile } from "../services/auth";
import TaskBox, { Task } from "./TaskBox";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error(
    ".env is missing the definition of an API_URL environment variable"
  );
}

type State = {
  tasks: Task[];
};

type Action =
  | { type: "CLEAR_TASKS" }
  | {
      type: "LOAD_TASKS";
      data: {
        additionalTasks: Task[];
      };
    };

const reducer = (prevState: State, action: Action): State => {
  switch (action.type) {
    case "CLEAR_TASKS":
      return { ...prevState, tasks: [] };
    case "LOAD_TASKS":
      return {
        ...prevState,
        tasks: [...prevState.tasks, ...action.data.additionalTasks],
      };
    default:
      throw new Error("Unknown Action type");
  }
};

const initialState: State = {
  tasks: [],
};

const Tasks = () => {
  const [{ tasks }, dispatch] = useReducer(reducer, initialState);
  const currentUser = getProfile();

  if (!("email" in currentUser)) {
    return null;
  }

  const { name } = currentUser;

  const loadTasks = async () => {
    dispatch({ type: "CLEAR_TASKS" });

    try {
      const jsonResponse = await fetch(API_URL + `/tasks`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (jsonResponse.status >= 400) {
        console.log(jsonResponse);
        return;
      }

      const response = await jsonResponse.json();

      dispatch({ type: "LOAD_TASKS", data: { additionalTasks: response } });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <View title="Tasks">
      {tasks.map((task, index) => (
        <TaskBox key={index} task={task} />
      ))}
    </View>
  );
};

export default Tasks;
