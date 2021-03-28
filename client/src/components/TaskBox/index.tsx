import React from "react";
import {
  container,
  leftColumn,
  rightColumn,
  columnDivider,
  taskCreator,
  taskURL,
  taskTime,
  taskStatus,
} from "./taskbox.module.css";
import { Link } from "gatsby";

export type TaskResponse = {
  status: null | number;
  body: string;
};

export type TaskStatus =
  | "scheduled"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface Task {
  _id: string;
  title: string;
  taskURL: string;
  delayInMS: number;
  status: TaskStatus;
  updatedAt: Date;
  creatorEmail: string;
  response: TaskResponse;
}

type TaskProps = {
  task: Task;
};

export function getScheduledTimeString(creationTime: Date, delayInMS: number) {
  let scheduledTime = new Date(new Date(creationTime).getTime() + delayInMS);
  let result =
    `${scheduledTime.toLocaleTimeString([], {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    })}, ` + `${scheduledTime.toDateString()}`;

  return result;
}

export function getStatusTint(status: TaskStatus) {
  switch (status) {
    case "failed":
      return "rgba(245, 128, 128, 0.5)";
    case "completed":
      return "rgba(144, 238, 144, 0.7)";
    case "scheduled":
      return "rgba(105, 176, 220, 0.7)";
    case "cancelled":
      return "rgba(255, 127, 80, 0.5)";
    case "running":
      return "rgba(255, 215, 0, 0.5)";
  }
}

export function getStatusTextColor(status: TaskStatus) {
  switch (status) {
    case "failed":
      return "rgba(200, 34, 34, 1)";
    case "completed":
      return "rgba(46, 139, 87, 1)";
    case "scheduled":
      return "rgba(0, 0, 100, 1)";
    case "cancelled":
      return "rgba(255, 140, 0, 1)";
    case "running":
      return "rgba(184, 134, 11, 1)";
  }
}

export function getStatusString(status: TaskStatus) {
  switch (status) {
    case "failed":
      return "Failed";
    case "completed":
      return "Completed";
    case "scheduled":
      return "Scheduled";
    case "cancelled":
      return "Cancelled";
    case "running":
      return "Running";
  }
}

const TaskBox = ({ task }: TaskProps) => (
  <div className={container}>
    <div className={columnDivider}>
      <div className={leftColumn}>
        <p className={taskCreator}>{task.creatorEmail}</p>
        <Link to={`/app/task/${task._id}`}>
          <p className={taskURL}>{task.title ?? "#No title"}</p>
        </Link>
        <p className={taskTime}>
          {getScheduledTimeString(task.updatedAt, task.delayInMS)}
        </p>
      </div>
      <div className={rightColumn}>
        <p
          style={{
            backgroundColor: getStatusTint(task.status),
            color: getStatusTextColor(task.status),
          }}
          className={taskStatus}
        >
          {getStatusString(task.status)}
        </p>
      </div>
    </div>
  </div>
);

export default TaskBox;
