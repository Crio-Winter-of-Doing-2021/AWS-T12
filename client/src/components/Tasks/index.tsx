import React, { useEffect, useReducer } from "react";
import View from "../View";
import { getProfile } from "../../services/auth";
import TaskBox, { Task, TaskStatus } from "../TaskBox";
import { Link } from "gatsby";
import {
  taskFilterDiv,
  taskFilterButton,
  selected,
  taskScheduleDiv,
  taskScheduleButton,
  taskOptionsDiv,
} from "./tasks.module.css";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error(
    ".env is missing the definition of an API_URL environment variable"
  );
}

type State = {
  tasks: Task[];
  taskFilter: TaskStatus | null;
};

type Action =
  | { type: "CLEAR_TASKS" }
  | {
      type: "LOAD_TASKS";
      data: {
        additionalTasks: Task[];
      };
    }
  | {
      type: "CHANGE_STATUS_FILTER";
      data: {
        status: TaskStatus | null;
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
    case "CHANGE_STATUS_FILTER":
      return {
        ...prevState,
        taskFilter: action.data.status,
      };
    default:
      throw new Error("Unknown Action type");
  }
};

const initialState: State = {
  tasks: [],
  taskFilter: null,
};

const Tasks = () => {
  const [{ tasks, taskFilter }, dispatch] = useReducer(reducer, initialState);
  const currentUser = getProfile();

  if (!("email" in currentUser)) {
    return null;
  }

  const { name } = currentUser;

  const loadTasks = async () => {
    dispatch({ type: "CLEAR_TASKS" });

    try {
      const taskEndpoint =
        API_URL +
        `/tasks` +
        (taskFilter === null ? "" : `?status=${taskFilter}`);

      const jsonResponse = await fetch(taskEndpoint, {
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
  }, [taskFilter]);

  const getTaskStatusFilterOnclickHandler = (status: TaskStatus) => {
    const taskStatusFilterOnclickHandler = () => {
      if (taskFilter == status) {
        dispatch({ type: "CHANGE_STATUS_FILTER", data: { status: null } });
        return;
      }

      dispatch({ type: "CHANGE_STATUS_FILTER", data: { status: status } });
    };

    return taskStatusFilterOnclickHandler;
  };

  return (
    <View title="Tasks">
      <div className={taskOptionsDiv}>
        <div className={taskFilterDiv}>
          <button
            type="button"
            className={`${taskFilterButton} ${
              taskFilter === "scheduled" ? selected : ""
            }`}
            onClick={getTaskStatusFilterOnclickHandler("scheduled")}
          >
            Scheduled
          </button>
          <button
            type="button"
            className={`${taskFilterButton} ${
              taskFilter === "completed" ? selected : ""
            }`}
            onClick={getTaskStatusFilterOnclickHandler("completed")}
          >
            Completed
          </button>
          <button
            type="button"
            className={`${taskFilterButton} ${
              taskFilter === "running" ? selected : ""
            }`}
            onClick={getTaskStatusFilterOnclickHandler("running")}
          >
            Running
          </button>
          <button
            type="button"
            className={`${taskFilterButton} ${
              taskFilter === "failed" ? selected : ""
            }`}
            onClick={getTaskStatusFilterOnclickHandler("failed")}
          >
            Failed
          </button>
          <button
            type="button"
            className={`${taskFilterButton} ${
              taskFilter === "cancelled" ? selected : ""
            }`}
            onClick={getTaskStatusFilterOnclickHandler("cancelled")}
          >
            Cancelled
          </button>
        </div>
        <div className={taskScheduleDiv}>
          <button type="button" className={taskScheduleButton}>
            <Link to="/app/tasks/schedule">Create</Link>
          </button>
        </div>
      </div>
      {tasks.map((task, index) => (
        <TaskBox key={index} task={task} />
      ))}
    </View>
  );
};

export default Tasks;
