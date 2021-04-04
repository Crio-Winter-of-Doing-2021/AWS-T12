import React, { useEffect, useReducer } from "react";
import View from "../View";
// import { getProfile } from "../../services/auth";
import OrchestrationBox, {
  Orchestration,
  OrchestrationStatus,
  getStatusString,
} from "../OrchestrationBox";
import { Link } from "gatsby";
import {
  orchestrationFilterDiv,
  orchestrationFilterButton,
  selected,
  orchestrationScheduleDiv,
  orchestrationScheduleButton,
  orchestrationOptionsDiv,
} from "./orchestrations.module.css";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error(
    ".env is missing the definition of an API_URL environment variable"
  );
}

type State = {
  orchestrations: Orchestration[];
  orchestrationFilter: OrchestrationStatus | null;
};

type Action =
  | { type: "CLEAR_ORCHESTRATIONS" }
  | {
      type: "LOAD_ORCHESTRATIONS";
      data: {
        additionalOrchestrations: Orchestration[];
      };
    }
  | {
      type: "CHANGE_STATUS_FILTER";
      data: {
        status: OrchestrationStatus | null;
      };
    };

const reducer = (prevState: State, action: Action): State => {
  switch (action.type) {
    case "CLEAR_ORCHESTRATIONS":
      return { ...prevState, orchestrations: [] };
    case "LOAD_ORCHESTRATIONS":
      return {
        ...prevState,
        orchestrations: [
          ...prevState.orchestrations,
          ...action.data.additionalOrchestrations,
        ],
      };
    case "CHANGE_STATUS_FILTER":
      return {
        ...prevState,
        orchestrationFilter: action.data.status,
      };
    default:
      throw new Error("Unknown Action type");
  }
};

const initialState: State = {
  orchestrations: [],
  orchestrationFilter: null,
};

const Orchestrations = () => {
  const [{ orchestrations, orchestrationFilter }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const statusFilterArray: OrchestrationStatus[] = [
    "scheduled",
    "running",
    "completed-second",
    "completed-fallback",
    "failed-first",
    "failed-condition",
    "failed-second",
    "failed-fallback",
    "cancelled",
  ];

  const loadOrchestrations = async () => {
    dispatch({ type: "CLEAR_ORCHESTRATIONS" });

    try {
      const orchestrationEndpoint =
        API_URL +
        `/orchestrations` +
        (orchestrationFilter === null ? "" : `?status=${orchestrationFilter}`);

      const jsonResponse = await fetch(orchestrationEndpoint, {
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

      dispatch({
        type: "LOAD_ORCHESTRATIONS",
        data: { additionalOrchestrations: response },
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadOrchestrations();
  }, [orchestrationFilter]);

  const getTaskStatusFilterOnclickHandler = (status: OrchestrationStatus) => {
    const taskStatusFilterOnclickHandler = () => {
      if (orchestrationFilter == status) {
        dispatch({ type: "CHANGE_STATUS_FILTER", data: { status: null } });
        return;
      }

      dispatch({ type: "CHANGE_STATUS_FILTER", data: { status: status } });
    };

    return taskStatusFilterOnclickHandler;
  };

  return (
    <View title="Orchestrations">
      <div className={orchestrationOptionsDiv}>
        <div className={orchestrationFilterDiv}>
          {statusFilterArray.map((filter, index) => (
            <button
              key={index}
              type="button"
              className={`${orchestrationFilterButton} ${
                orchestrationFilter === filter ? selected : ""
              }`}
              onClick={getTaskStatusFilterOnclickHandler(filter)}
            >
              {getStatusString(filter)}
            </button>
          ))}
        </div>
        <div className={orchestrationScheduleDiv}>
          <button type="button" className={orchestrationScheduleButton}>
            <Link to="/app/orchestrations/schedule">Create</Link>
          </button>
        </div>
      </div>
      {orchestrations.map((orchestration, index) => (
        <OrchestrationBox key={index} orchestration={orchestration} />
      ))}
    </View>
  );
};

export default Orchestrations;
