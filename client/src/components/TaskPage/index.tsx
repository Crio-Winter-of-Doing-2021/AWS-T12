import React, { ChangeEvent, useEffect, useState } from "react";
import View from "../View";
import { getProfile, getAccessToken } from "../../services/auth";
import {
  Task,
  TaskStatus,
  TaskResponse,
  getScheduledTimeString,
  getStatusTextColor,
  getStatusString,
} from "../TaskBox";
import {
  taskDetailsDiv,
  taskInfoDiv,
  taskInfoLabel,
  taskInfo,
  taskCancelDiv,
  taskCancelButton,
  taskRefreshDiv,
  taskRefreshButton,
  taskScheduledTimeDiv,
  timeEditButton,
  timeEditSaveButton,
  timeEditDiscardButton,
} from "./taskpage.module.css";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error(
    ".env is missing the definition of an API_URL environment variable"
  );
}

const getDelayFromNowInMS = (timeString: string) => {
  let futureTime = new Date(timeString);
  return futureTime.getTime() - Date.now();
};

type TaskPageProps = {
  taskID: string;
};

const TaskPage = ({ taskID }: TaskPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [taskURL, setTaskURL] = useState("");
  const [status, setStatus] = useState<TaskStatus>("cancelled");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [delayInMS, setDelayInMs] = useState(0);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [response, setResponse] = useState<TaskResponse>({
    status: null,
    body: "",
  });

  const setTask = (task: Task) => {
    setTitle(task.title);
    setTaskURL(task.taskURL);
    setStatus(task.status);
    setCreatorEmail(task.creatorEmail);
    setResponse(task.response);
    setUpdatedAt(task.updatedAt);
    setDelayInMs(task.delayInMS);
    const tzoffset = new Date().getTimezoneOffset() * 60000;
    const offsetDate = new Date(
      new Date(task.updatedAt).getTime() + task.delayInMS - tzoffset
    );
    setScheduledTime(offsetDate.toISOString().slice(0, -8));
  };

  const handleCancel = async () => {
    const jsonResponse = await fetch(`${API_URL}/tasks/${taskID}/cancel`, {
      method: "PUT",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });

    if (jsonResponse.status >= 400) {
      console.error("Cancellation failed.");
      return;
    }

    const cancelled = await jsonResponse.json();

    if (!cancelled) {
      console.error("Cancellation failed.");
      return;
    }

    if (cancelled) {
      await loadTask(taskID);
    }
  };

  const handleTimeEdit = async () => {
    const newScheduledTime = new Date(scheduledTime);
    const newDelayInMS = newScheduledTime.getTime() - Date.now();
    if (newDelayInMS < 0) {
      // TODO: show this in UI
      return;
    }

    const jsonResponse = await fetch(`${API_URL}/tasks/${taskID}`, {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ delayInMS: newDelayInMS }),
    });

    if (jsonResponse.status >= 400) {
      console.error("Modification failed.");
      return;
    }

    const modified = await jsonResponse.json();

    if (!modified) {
      console.error("Modification failed.");
      return;
    }

    if (modified) {
      await loadTask(taskID);
      setIsEditingTime(false);
    }
  };

  const currentUser = getProfile();
  if (!("email" in currentUser)) {
    return null;
  }

  const loadTask = async (taskID: string) => {
    try {
      const taskEndpoint = API_URL + `/tasks/${taskID}`;

      const jsonResponse = await fetch(taskEndpoint, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (jsonResponse.status >= 400) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      const response = await jsonResponse.json();

      setTask(response);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadTask(taskID);
  };

  useEffect(() => {
    loadTask(taskID);
  }, []);

  if (isLoading) {
    return <View title="Loading..." />;
  }

  if (isNotFound) {
    return <View title={`404: Yo! No task with ID ${taskID}`} />;
  }

  return (
    <View title={`${title}`}>
      <div className={taskRefreshDiv}>
        <button
          type="button"
          className={taskRefreshButton}
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>

      <div className={taskDetailsDiv}>
        <div className={taskInfoDiv}>
          <label className={taskInfoLabel}>URL:</label>
          <span className={taskInfo}>{taskURL}</span>
        </div>

        <div className={taskInfoDiv}>
          <label className={taskInfoLabel}>Created by:</label>
          <span className={taskInfo}>{creatorEmail}</span>
        </div>

        <div className={taskScheduledTimeDiv}>
          <div className={taskInfoDiv}>
            <label className={taskInfoLabel}>Scheduled at:</label>
            {isEditingTime ? (
              <>
                <input
                  className={taskInfo}
                  type="datetime-local"
                  value={scheduledTime}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setScheduledTime(event.target.value);
                  }}
                />
                <button
                  type="button"
                  className={timeEditSaveButton}
                  onClick={handleTimeEdit}
                >
                  Save
                </button>
                <button
                  type="button"
                  className={timeEditDiscardButton}
                  onClick={() => {
                    setIsEditingTime(false);
                  }}
                >
                  Discard
                </button>
              </>
            ) : (
              <>
                <span className={taskInfo}>
                  {getScheduledTimeString(updatedAt, delayInMS)}
                </span>
                {status === "scheduled" && creatorEmail === currentUser.email && (
                  <button
                    type="button"
                    className={timeEditButton}
                    onClick={() => {
                      setIsEditingTime(true);
                    }}
                  >
                    Edit
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <div className={taskInfoDiv}>
          <label className={taskInfoLabel}>Status:</label>
          <span
            className={taskInfo}
            style={{ color: getStatusTextColor(status) }}
          >
            {getStatusString(status)}
          </span>
        </div>

        {(status === "completed" || status === "failed") &&
          (response.status == null ? (
            <div className={taskInfoDiv}>
              <label className={taskInfoLabel}>Reason:</label>
              <span className={taskInfo}>The taskURL was not callable.</span>
            </div>
          ) : (
            <>
              <div className={taskInfoDiv}>
                <label className={taskInfoLabel}>Response Status:</label>
                <span className={taskInfo}>{response.status}</span>
              </div>

              <div className={taskInfoDiv}>
                <label className={taskInfoLabel}>Response Body:</label>
                <code>{response.body}</code>
              </div>
            </>
          ))}

        {status === "scheduled" && creatorEmail === currentUser.email && (
          <div className={taskCancelDiv}>
            <button
              type="button"
              className={taskCancelButton}
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </View>
  );
};

export default TaskPage;
