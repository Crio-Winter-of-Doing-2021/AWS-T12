import React, { ChangeEvent, useEffect, useState } from "react";
import View from "../View";
// import { getProfile, getAccessToken } from "../../services/auth";
import {
  Orchestration,
  OrchestrationStatus,
  getStatusTextColor,
  getStatusString,
} from "../OrchestrationBox";
import { getScheduledTimeString } from "../TaskBox";
import {
  orchestrationDetailsDiv,
  orchestrationInfoDiv,
  orchestrationInfoLabel,
  orchestrationInfo,
  //   taskCancelDiv,
  //   taskCancelDiv,
  orchestrationRefreshDiv,
  orchestrationRefreshButton,
  orchestrationScheduledTimeDiv,
  //   timeEditButton,
  //   timeEditSaveButton,
  //   timeEditDiscardButton,
} from "./orchestrationpage.module.css";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error(
    ".env is missing the definition of an API_URL environment variable"
  );
}

// const getDelayFromNowInMS = (timeString: string) => {
//   let futureTime = new Date(timeString);
//   return futureTime.getTime() - Date.now();
// };

type OrchestrationPageProps = {
  orchestrationID: string;
};

const OrchestrationPage = ({ orchestrationID }: OrchestrationPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [title, setTitle] = useState("");
  const [firstTaskURL, setFirstTaskURL] = useState("");
  const [secondTaskURL, setSecondTaskURL] = useState("");
  const [conditionCheckTaskURL, setConditionCheckTaskURL] = useState("");
  const [fallbackTaskURL, setFallbackTaskURL] = useState("");
  const [status, setStatus] = useState<OrchestrationStatus>("cancelled");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [initialDelayInMS, setInitialDelayInMs] = useState(0);
  const [
    timeDelayBetweenRetriesInMS,
    setTimeDelayBetweenRetriesInMS,
  ] = useState(0);
  const [conditionalCheckRetries, setConditionalCheckRetries] = useState(0);
  const [conditionCheckDelayInMS, setConditionCheckDelayInMS] = useState(0);
  //   const [isEditingTime, setIsEditingTime] = useState(false);
  //   const [scheduledTime, setScheduledTime] = useState("");
  //   const [response, setResponse] = useState<TaskResponse>({
  //     status: null,
  //     body: "",
  //   });

  const setOrchestration = (orchestration: Orchestration) => {
    setTitle(orchestration.title);
    setFirstTaskURL(orchestration.firstTaskURL);
    setSecondTaskURL(orchestration.secondTaskURL);
    setFallbackTaskURL(orchestration.fallbackTaskURL);
    setConditionCheckTaskURL(orchestration.conditionCheckTaskURL);
    setStatus(orchestration.status);
    setCreatorEmail(orchestration.creatorEmail);
    setUpdatedAt(orchestration.updatedAt);
    setInitialDelayInMs(orchestration.initialDelayInMS);
    setTimeDelayBetweenRetriesInMS(orchestration.timeDelayBetweenRetriesInMS);
    setConditionalCheckRetries(orchestration.conditionCheckRetries);
    setConditionCheckDelayInMS(orchestration.conditionCheckDelayInMS);
  };

  const loadOrchestration = async (orchestrationID: string) => {
    try {
      const orchestrationEndpoint =
        API_URL + `/orchestrations/${orchestrationID}`;

      const jsonResponse = await fetch(orchestrationEndpoint, {
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

      setOrchestration(response);
      setIsLoading(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadOrchestration(orchestrationID);
  };

  useEffect(() => {
    loadOrchestration(orchestrationID);
  }, []);

  if (isLoading) {
    return <View title="Loading..." />;
  }

  if (isNotFound) {
    return (
      <View title={`404: Yo! No orchestration with ID ${orchestrationID}`} />
    );
  }

  return (
    <View title={`${title}`}>
      <div className={orchestrationRefreshDiv}>
        <button
          type="button"
          className={orchestrationRefreshButton}
          onClick={handleRefresh}
        >
          Refresh
        </button>
      </div>
      <div className={orchestrationInfoDiv}>
        <label className={orchestrationInfoLabel}>Created by:</label>
        <span className={orchestrationInfo}>{creatorEmail}</span>
      </div>

      <div className={orchestrationScheduledTimeDiv}>
        <div className={orchestrationInfoDiv}>
          <label className={orchestrationInfoLabel}>Scheduled at:</label>
          <span className={orchestrationInfo}>
            {getScheduledTimeString(updatedAt, initialDelayInMS)}
          </span>
        </div>
      </div>

      <div className={orchestrationInfoDiv}>
        <label className={orchestrationInfoLabel}>Status:</label>
        <span
          className={orchestrationInfo}
          style={{ color: getStatusTextColor(status) }}
        >
          {getStatusString(status)}
        </span>
      </div>

      <div className={orchestrationDetailsDiv}>
        <div className={orchestrationInfoDiv}>
          <label className={orchestrationInfoLabel}>First Task URL:</label>
          <span className={orchestrationInfo}>{firstTaskURL}</span>
        </div>

        <div className={orchestrationInfoDiv}>
          <label className={orchestrationInfoLabel}>
            Conditional Check Delay (in ms):
          </label>
          <span className={orchestrationInfo}>{conditionCheckDelayInMS}</span>
        </div>

        <div className={orchestrationInfoDiv}>
          <label className={orchestrationInfoLabel}>
            Conditional Check Task URL:
          </label>
          <span className={orchestrationInfo}>{conditionCheckTaskURL}</span>
        </div>

        <div className={orchestrationInfoDiv}>
          <label className={orchestrationInfoLabel}>
            Conditional Check Retires:
          </label>
          <span className={orchestrationInfo}>{conditionalCheckRetries}</span>
        </div>

        <div className={orchestrationInfoDiv}>
          <label className={orchestrationInfoLabel}>
            Time between conditional check Retries (in ms):
          </label>
          <span className={orchestrationInfo}>
            {timeDelayBetweenRetriesInMS}
          </span>
        </div>

        <div className={orchestrationInfoDiv}>
          <label className={orchestrationInfoLabel}>Second Task URL:</label>
          <span className={orchestrationInfo}>{secondTaskURL}</span>
        </div>

        <div className={orchestrationInfoDiv}>
          <label className={orchestrationInfoLabel}>Fallback Task URL:</label>
          <span className={orchestrationInfo}>{fallbackTaskURL}</span>
        </div>
      </div>
    </View>
  );
};

export default OrchestrationPage;
