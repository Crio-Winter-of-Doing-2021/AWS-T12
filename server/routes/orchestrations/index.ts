import express, { Request, Response, NextFunction } from "express";

import {
  //   cancel,
  //   modify,
  retrieveAllOrchestrationsPaginated,
  //   retrieveAllUserTasksPaginated,
  retrieveOrchestrationInstance,
  retrieveOrchestrationInstancesPaginated,
  //   retrieveUserTaskInstancesPaginated,
  orchestrate,
} from "../../classes/Orchestrator";
import { checkJwt } from "../../auth/check-jwt";

const router = express.Router();

// GET / - fetches list of all orchestrations, with an option for status filter
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const defaultLimit = 100;
  const defaultOffset = 0;

  const offset = parseInt((req.query.offset || defaultOffset).toString(), 10);

  if (req.query.status) {
    // Return orchestrations filtered by status, if the status filter is valid
    // If status filter is invalid send 400: Bad request
    const status = req.query.status.toString();

    switch (status) {
      case "scheduled":
      case "cancelled":
      case "running":
      case "completed-fallback":
      case "completed-second":
      case "failed-first":
      case "failed-fallback":
      case "failed-condition":
      case "failed-second":
        break;
      default:
        res
          .status(400)
          .json(
            "status should be one of {scheduled, cancelled, running, scheduled" +
              ", completed-fallback, completed-second, failed-first, failed-fallback" +
              ", failed-condition, failed-second}"
          );
        return;
    }

    try {
      const orchestrations = await retrieveOrchestrationInstancesPaginated(
        status,
        defaultLimit,
        offset
      );
      res.status(200).json(orchestrations);
    } catch (e) {
      next(e);
    }
  } else {
    // No status filter, so return all orchestrations
    try {
      const orchestrations = await retrieveAllOrchestrationsPaginated(
        defaultLimit,
        offset
      );
      res.status(200).json(orchestrations);
    } catch (e) {
      next(e);
    }
  }
});

// GET /<id> - get the details of a single orchestration
router.get("/:id", async (req: Request, res: Response) => {
  const orchestrationID = req.params.id.toString();
  const orchestration = await retrieveOrchestrationInstance(orchestrationID);

  if (orchestration === null) {
    res
      .status(404)
      .send(
        "The orchestrationID does not match a orchestration in the database"
      );
    return;
  }

  res.json(orchestration);
});

// POST / [protected]- creates a new scheduled orchestration
router.post(
  "/",
  checkJwt,
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      title,
      firstTaskURL,
      conditionCheckTaskURL,
      fallbackTaskURL,
      secondTaskURL,
      initialDelayInMS,
      timeDelayBetweenRetriesInMS,
      conditionCheckDelayInMS,
      conditionCheckRetries,
    } = req.body;

    // If any of the required body parameters
    // are missing then send Status 422: Unprocessable Entity
    if (!firstTaskURL) {
      res.status(422).json("required body parameter 'firstTaskURL' missing");
      return;
    }
    if (!conditionCheckTaskURL) {
      res.status(422).json("required body parameter 'firstTaskURL' missing");
      return;
    }
    if (!fallbackTaskURL) {
      res.status(422).json("required body parameter 'firstTaskURL' missing");
      return;
    }
    if (!secondTaskURL) {
      res.status(422).json("required body parameter 'firstTaskURL' missing");
      return;
    }
    if (!title) {
      res.status(422).json("required body parameter 'title' missing");
      return;
    }
    if (initialDelayInMS === undefined) {
      res
        .status(422)
        .json("required body parameter 'initialDelayInMS' missing");
      return;
    }
    if (
      conditionCheckRetries !== undefined &&
      timeDelayBetweenRetriesInMS < 0
    ) {
      res
        .status(422)
        .json("Condition check Retry delay needs to be non-negative");
      return;
    }

    const creatorEmail = req.user["https://dev-taskmaster-arijit.com/email"];

    try {
      const id = await orchestrate(
        creatorEmail,
        title,
        firstTaskURL,
        initialDelayInMS < 0 ? 0 : initialDelayInMS,
        secondTaskURL,
        conditionCheckTaskURL,
        fallbackTaskURL,
        conditionCheckDelayInMS ?? 0,
        conditionCheckRetries ?? 0,
        timeDelayBetweenRetriesInMS ?? 0
      );

      // Send response Status 201: Created
      // with the newly created orchestration object's ID
      res.status(201).json(id);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
