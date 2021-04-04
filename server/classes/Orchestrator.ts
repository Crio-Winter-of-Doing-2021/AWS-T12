import OrchestrationModel, {
  OrchestrationStatus,
  OrchestrationDocument,
} from "../models/Orchestration";
import fetch from "node-fetch";

import { scheduleJob } from "node-schedule";

let orchestratedJobs = {};

export const retrieveAllOrchestrations = async () => {
  const orchestrations = await OrchestrationModel.find().sort({
    updatedAt: -1,
  });
  return orchestrations;
};

export const retrieveAllUserOrchestrations = async (email: string) => {
  const orchestrations = OrchestrationModel.find({ creatorEmail: email }).sort({
    updatedAt: -1,
  });
  return orchestrations;
};

export const retrieveAllOrchestrationsPaginated = async (
  limit: number,
  offset: number
) => {
  const orchestrations = await OrchestrationModel.find()
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit);
  return orchestrations;
};

export const retrieveAllUserOrchestrationsPaginated = async (
  email: string,
  limit: number,
  offset: number
) => {
  const orchestrations = await OrchestrationModel.find({ creatorEmail: email })
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit);
  return orchestrations;
};

export const retrieveOrchestrationInstances = async (
  status: OrchestrationStatus
) => {
  const orchestrations = await OrchestrationModel.find({ status: status }).sort(
    {
      updatedAt: -1,
    }
  );
  return orchestrations;
};

export const retrieveUserOrchestrationInstances = async (
  email: string,
  status: OrchestrationStatus
) => {
  const orchestrations = await OrchestrationModel.find({
    creatorEmail: email,
    status: status,
  }).sort({
    updatedAt: -1,
  });
  return orchestrations;
};

export const retrieveOrchestrationInstance = async (
  orchestrationID: string
) => {
  try {
    const orchestration = await OrchestrationModel.findOne({
      _id: orchestrationID,
    });
    return orchestration;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const retrieveOrchestrationInstancesPaginated = async (
  status: OrchestrationStatus,
  limit: number,
  offset: number
) => {
  const orchestrations = await OrchestrationModel.find({ status: status })
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit);
  return orchestrations;
};

export const retrieveUserOrchestrationInstancesPaginated = async (
  email: string,
  status: OrchestrationStatus,
  limit: number,
  offset: number
) => {
  const orchestrations = await OrchestrationModel.find({
    creatorEmail: email,
    status: status,
  })
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit);
  return orchestrations;
};

const updateOrchestrationStatus = async (
  orchestrationID: string,
  status: OrchestrationStatus
) => {
  try {
    const updatedOrchestration = await OrchestrationModel.findOneAndUpdate(
      { _id: orchestrationID },
      { status: status },
      { new: true }
    );

    return updatedOrchestration;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const finishOrchestration = async (
  orchestrationID: string,
  status: OrchestrationStatus
) => {
  try {
    await OrchestrationModel.findOneAndUpdate(
      { _id: orchestrationID },
      { status: status },
      { new: true }
    );
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
};

const addRetryEntry = async (orchestrationId: string) => {
  try {
    const updatedOrchestration = await OrchestrationModel.findOneAndUpdate(
      { _id: orchestrationId },
      { $inc: { actualConditionCheckTryCount: 1 } },
      { new: true }
    );
    return updatedOrchestration;
  } catch (e) {
    console.error(e);
    return null;
  }
};

const getSecondTaskPerformer = (orchestration: OrchestrationDocument) => {
  const secondTaskPerformer = async () => {
    if (orchestration.status !== "running") {
      orchestration = await updateOrchestrationStatus(
        orchestration._id,
        "running"
      );
    }

    try {
      const response = await fetch(orchestration.secondTaskURL, {
        method: "GET",
      });

      if (response.status >= 200 && response.status < 300) {
        await finishOrchestration(orchestration._id, "completed-second");
      } else {
        await finishOrchestration(orchestration._id, "failed-second");
      }

      delete orchestratedJobs[orchestration._id];
    } catch (e) {
      await finishOrchestration(orchestration._id, "failed-second");
    }
  };

  return secondTaskPerformer;
};

const getFallbackTaskPerformer = (orchestration: OrchestrationDocument) => {
  const fallbackTaskPerformer = async () => {
    if (orchestration.status !== "running") {
      orchestration = await updateOrchestrationStatus(
        orchestration._id,
        "running"
      );
    }

    try {
      const response = await fetch(orchestration.fallbackTaskURL, {
        method: "GET",
      });

      if (response.status >= 200 && response.status < 300) {
        await finishOrchestration(orchestration._id, "completed-fallback");
      } else {
        await finishOrchestration(orchestration._id, "failed-fallback");
      }

      delete orchestratedJobs[orchestration._id];
    } catch (e) {
      await finishOrchestration(orchestration._id, "failed-fallback");
    }
  };

  return fallbackTaskPerformer;
};

const getConditionalPerformer = (orchestration: OrchestrationDocument) => {
  const conditionalPerformer = async () => {
    if (orchestration.status !== "running") {
      orchestration = await updateOrchestrationStatus(
        orchestration._id,
        "running"
      );
    }

    try {
      const response = await fetch(orchestration.conditionCheckTaskURL, {
        method: "GET",
      });

      if (response.status >= 200 && response.status < 300) {
        const secondTaskPerformer = getSecondTaskPerformer(orchestration);
        secondTaskPerformer();
      } else if (
        orchestration.actualConditionCheckTryCount >=
        orchestration.conditionCheckRetries
      ) {
        // This condition has been invoked actualConditionCheckTryCount + 1 times,
        // without success
        // If that is atleast conditionCheckRetries + 1 times, then perform fallbackTask
        const fallbackPerformer = getFallbackTaskPerformer(orchestration);
        fallbackPerformer();
      } else {
        // retries are left
        const retriedOrchestration = await addRetryEntry(orchestration._id);

        if (retriedOrchestration.timeDelayBetweenRetriesInMS == 0) {
          const retriedOrchestrationPerformer = getConditionalPerformer(
            retriedOrchestration
          );
          retriedOrchestrationPerformer();
        } else {
          const jobTime = new Date(
            Date.now() + retriedOrchestration.timeDelayBetweenRetriesInMS
          );

          delete orchestratedJobs[retriedOrchestration._id];
          orchestratedJobs[retriedOrchestration._id] = scheduleJob(
            jobTime,
            getConditionalPerformer(retriedOrchestration)
          );
        }
      }
    } catch (e) {
      await finishOrchestration(orchestration._id, "failed-condition");
    }
  };

  return conditionalPerformer;
};

const getOrchestrationPerformer = (orchestration: OrchestrationDocument) => {
  const orchestrationPerformer = async () => {
    orchestration = await updateOrchestrationStatus(
      orchestration._id,
      "running"
    );

    try {
      const response = await fetch(orchestration.firstTaskURL, {
        method: "GET",
      });

      if (response.status >= 200 && response.status < 300) {
        const conditionCheckJobTime = new Date(
          Date.now() + orchestration.conditionCheckDelayInMS
        );
        orchestratedJobs[orchestration._id] = scheduleJob(
          conditionCheckJobTime,
          getConditionalPerformer(orchestration)
        );
      } else {
        await finishOrchestration(orchestration._id, "failed-first");
        delete orchestratedJobs[orchestration._id];
      }
    } catch (e) {
      await finishOrchestration(orchestration._id, "failed-first");
    }
  };

  return orchestrationPerformer;
};

export const orchestrate = async (
  creatorEmail: string,
  title: string,
  firstTaskURL: string,
  initialDelayInMS: number,
  secondTaskURL: string,
  conditionCheckTaskURL: string,
  fallbackTaskURL: string,
  conditionCheckDelayInMS: number,
  conditionCheckRetries: number,
  timeDelayBetweenRetriesInMS: number
) => {
  // If any delay is negative, return null
  if (initialDelayInMS < 0) return null;
  if (conditionCheckDelayInMS < 0) return null;
  if (timeDelayBetweenRetriesInMS < 0) return null;

  // Create the orchestration object in the database
  const createdOrchestration = await OrchestrationModel.create({
    creatorEmail,
    title,
    firstTaskURL,
    initialDelayInMS,
    updatedAt: new Date(),
    status: "scheduled",
    conditionCheckTaskURL,
    conditionCheckDelayInMS,
    conditionCheckRetries,
    timeDelayBetweenRetriesInMS,
    fallbackTaskURL,
    secondTaskURL,
  });

  if (initialDelayInMS == 0) {
    const orchestrationPerformer = getOrchestrationPerformer(
      createdOrchestration
    );
    orchestrationPerformer();
  } else {
    const jobTime = new Date(Date.now() + initialDelayInMS);
    orchestratedJobs[createdOrchestration._id] = scheduleJob(
      jobTime,
      getOrchestrationPerformer(createdOrchestration)
    );
  }

  return createdOrchestration._id;
};

// Function to refresh node-schedule on server startup
export const refreshOrchestrator = async () => {
  // For orchestrations which were in running state (meaning the server failed
  // during their run), since we do not
  // know their fate, we update their status to cancelled
  // to be on the safe side
  const runningOrchestrations = await retrieveOrchestrationInstances("running");

  for (let orchestration of runningOrchestrations) {
    updateOrchestrationStatus(orchestration._id, "cancelled");
  }

  // Check previously scheduled orchestrations
  const scheduledOrchestrations = await retrieveOrchestrationInstances(
    "scheduled"
  );

  orchestratedJobs = {};

  for (let orchestration of scheduledOrchestrations) {
    const initialTaskTime =
      orchestration.updatedAt.getTime() + orchestration.initialDelayInMS;
    const delayFromNow = initialTaskTime - Date.now();

    if (delayFromNow < 0) {
      // Task's scheduled time has passed, so they must be updated to cancelled
      // status
      updateOrchestrationStatus(orchestration._id, "cancelled");
    } else {
      // re-add the orchestrations to node-schedule
      const jobTime = new Date(Date.now() + delayFromNow);
      orchestratedJobs[orchestration._id] = scheduleJob(
        jobTime,
        getOrchestrationPerformer(orchestration)
      );
    }
  }
};
