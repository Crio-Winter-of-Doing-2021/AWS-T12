import express, { Request, Response, NextFunction } from "express";

import {
  retrieveAllTasksPaginated,
  retrieveAllUserTasksPaginated,
  retrieveTaskInstancesPaginated,
  retrieveUserTaskInstancesPaginated,
  schedule,
} from "../../classes/Scheduler";
import { checkJwt } from "../../auth/check-jwt";

const router = express.Router();

// GET / - fetches list of all tasks, with an option for status filter
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const defaultLimit = 100;
  const defaultOffset = 0;

  const offset = parseInt((req.query.offset || defaultOffset).toString(), 10);

  if (req.query.status) {
    // Return tasks filtered by status, if the status filter is valid
    // If status filter is invalid send 400: Bad request
    const status = req.query.status.toString();

    switch (status) {
      case "scheduled":
      case "cancelled":
      case "running":
      case "completed":
      case "failed":
        break;
      default:
        res
          .status(400)
          .json(
            "status should be one of {scheduled, cancelled, running, completed, failed}"
          );
        return;
    }

    try {
      const tasks = await retrieveTaskInstancesPaginated(
        status,
        defaultLimit,
        offset
      );
      res.status(200).json(tasks);
    } catch (e) {
      next(e);
    }
  } else {
    // No status filter, so return all tasks
    try {
      const tasks = await retrieveAllTasksPaginated(defaultLimit, offset);
      res.status(200).json(tasks);
    } catch (e) {
      next(e);
    }
  }
});

// GET /my [protected]- fetches list of all tasks created by logged in user,
// with an option for status filter
router.get(
  "/my",
  checkJwt,
  async (req: Request, res: Response, next: NextFunction) => {
    const defaultLimit = 100;
    const defaultOffset = 0;

    const loggedInUserEmail =
      req.user["https://dev-taskmaster-arijit.com/email"];

    const offset = parseInt((req.query.offset || defaultOffset).toString(), 10);

    if (req.query.status) {
      // Return tasks filtered by status, if the status filter is valid
      // If status filter is invalid send 400: Bad request
      const status = req.query.status.toString();

      switch (status) {
        case "scheduled":
        case "cancelled":
        case "running":
        case "completed":
        case "failed":
          break;
        default:
          res
            .status(400)
            .json(
              "status should be one of {scheduled, cancelled, running, completed, failed}"
            );
          return;
      }

      try {
        const tasks = await retrieveUserTaskInstancesPaginated(
          loggedInUserEmail,
          status,
          defaultLimit,
          offset
        );
        res.status(200).json(tasks);
      } catch (e) {
        next(e);
      }
    } else {
      // No status filter, so return all tasks
      try {
        const tasks = await retrieveAllUserTasksPaginated(
          loggedInUserEmail,
          defaultLimit,
          offset
        );
        res.status(200).json(tasks);
      } catch (e) {
        next(e);
      }
    }
  }
);

// POST / [protected]- creates a new scheduled task
router.post(
  "/",
  checkJwt,
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, taskURL, delayInMS } = req.body;

    // If any of the three required body parameters (title, taskURL, delayInMS)
    // are missing then send Status 422: Unprocessable Entity
    if (!taskURL) {
      res.status(422).json("required body parameter 'taskURL' missing");
      return;
    }
    if (!title) {
      res.status(422).json("required body parameter 'title' missing");
      return;
    }
    if (delayInMS === undefined) {
      res.status(422).json("required body parameter 'delayInMS' missing");
      return;
    }

    const creatorEmail = req.user["https://dev-taskmaster-arijit.com/email"];

    try {
      const id = await schedule(creatorEmail, title, taskURL, delayInMS);

      // Send response Status 201: Created
      // with the newly created task object's ID
      res.status(201).json(id);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
