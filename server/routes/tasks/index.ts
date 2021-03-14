import express, { Request, Response, NextFunction } from "express";

import { retrieveAllTasksPaginated, schedule } from "../../classes/Scheduler";
import { checkJwt } from "../../auth/check-jwt";

const router = express.Router();

// GET / - fetches list of all tasks
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const defaultLimit = 100;
  const defaultOffset = 0;

  const offset = parseInt((req.query.offset || defaultOffset).toString(), 10);

  try {
    const tasks = await retrieveAllTasksPaginated(defaultLimit, offset);
    res.status(200).json(tasks);
  } catch (e) {
    next(e);
  }
});

// GET /my - fetches list of all tasks of signed in user
router.get(
  "/my",
  checkJwt,
  async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json(["private task"]);
  }
);

// POST / - creates a new scheduled task (protected API route)
router.post(
  "/",
  checkJwt,
  async (req: Request, res: Response, next: NextFunction) => {
    const { taskURL, delayInMS } = req.body;

    // If any of the two required body parameters (taskURL, delayInMS) are
    // missing then send Status 422: Unprocessable Entity
    if (!taskURL) {
      res.status(422).json("required body parameter 'taskURL' missing");
      return;
    }
    if (!delayInMS) {
      res.status(422).json("required body parameter 'delayInMS' missing");
      return;
    }

    try {
      const id = await schedule(taskURL, delayInMS);

      // Send response Status 201: Created
      // with the newly created task object's ID
      res.status(201).json(id);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
