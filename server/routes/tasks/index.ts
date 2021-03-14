import express, { Request, Response, NextFunction } from "express";

import { schedule } from "../../classes/Scheduler";
import { checkJwt } from "../../auth/check-jwt";

const router = express.Router();

// GET / - fetches list of all tasks
router.get("/", async (_req: Request, res: Response, _next: NextFunction) => {
  res.status(200).json([]);
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
  // checkJwt,
  async (req: Request, res: Response, _next: NextFunction) => {
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
      console.error(error);
      // Send Internal Server Error Status 500
      res
        .status(500)
        .send("Internal Server Error. Contact arijitbiley@gmail.com");
    }
  }
);

export default router;
