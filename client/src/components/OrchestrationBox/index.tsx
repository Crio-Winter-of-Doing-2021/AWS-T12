import React from "react";
import {
  container,
  columnDivider,
  leftColumn,
  rightColumn,
  orchestrationCreator,
  orchestrationTitle,
  orchestrationTime,
  orchestrationStatus,
} from "./orchestrationbox.module.css";
import { Link } from "gatsby";

import { getScheduledTimeString } from "../TaskBox";

export type OrchestrationStatus =
  | "scheduled"
  | "running"
  | "completed-second"
  | "completed-fallback"
  | "failed-first"
  | "failed-condition"
  | "failed-second"
  | "failed-fallback"
  | "cancelled";

export interface Orchestration {
  _id: string;
  title: string;
  firstTaskURL: string;
  initialDelayInMS: number;
  status: OrchestrationStatus;
  conditionCheckTaskURL: string;
  conditionCheckDelayInMS: number;
  conditionCheckRetries: number;
  timeDelayBetweenRetriesInMS: number;
  fallbackTaskURL: string;
  secondTaskURL: string;
  creatorEmail: string;
  updatedAt: Date;
  actualConditionCheckTryCount: number;
}

type OrchestrationProps = {
  orchestration: Orchestration;
};

export function getStatusTint(status: OrchestrationStatus) {
  switch (status) {
    case "failed-first":
    case "failed-second":
    case "failed-fallback":
    case "failed-condition":
      return "rgba(245, 128, 128, 0.5)";
    case "completed-fallback":
    case "completed-second":
      return "rgba(144, 238, 144, 0.7)";
    case "scheduled":
      return "rgba(105, 176, 220, 0.7)";
    case "cancelled":
      return "rgba(255, 127, 80, 0.5)";
    case "running":
      return "rgba(255, 215, 0, 0.5)";
  }
}

export function getStatusTextColor(status: OrchestrationStatus) {
  switch (status) {
    case "failed-first":
    case "failed-second":
    case "failed-fallback":
    case "failed-condition":
      return "rgba(200, 34, 34, 1)";
    case "completed-fallback":
    case "completed-second":
      return "rgba(46, 139, 87, 1)";
    case "scheduled":
      return "rgba(0, 0, 100, 1)";
    case "cancelled":
      return "rgba(255, 140, 0, 1)";
    case "running":
      return "rgba(184, 134, 11, 1)";
  }
}

export function getStatusString(status: OrchestrationStatus) {
  switch (status) {
    case "failed-first":
      return "Failed (at first)";
    case "failed-second":
      return "Failed (at Second)";
    case "failed-fallback":
      return "Failed (at fallback)";
    case "failed-condition":
      return "Failed (at condition check)";
    case "completed-second":
      return "Completed (with second)";
    case "completed-fallback":
      return "Completed (with fallback)";
    case "scheduled":
      return "Scheduled";
    case "cancelled":
      return "Cancelled";
    case "running":
      return "Running";
  }
}

const OrchestrationBox = ({ orchestration }: OrchestrationProps) => (
  <div className={container}>
    <div className={columnDivider}>
      <div className={leftColumn}>
        <p className={orchestrationCreator}>{orchestration.creatorEmail}</p>
        <Link to={`/app/orchestration/${orchestration._id}`}>
          <p className={orchestrationTitle}>
            {orchestration.title ?? "#No title"}
          </p>
        </Link>
        <p className={orchestrationTime}>
          {getScheduledTimeString(
            orchestration.updatedAt,
            orchestration.initialDelayInMS
          )}
        </p>
      </div>
      <div className={rightColumn}>
        <p
          style={{
            backgroundColor: getStatusTint(orchestration.status),
            color: getStatusTextColor(orchestration.status),
          }}
          className={orchestrationStatus}
        >
          {getStatusString(orchestration.status)}
        </p>
      </div>
    </div>
  </div>
);

export default OrchestrationBox;
