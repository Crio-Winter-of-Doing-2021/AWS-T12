import express, { Request, Response, NextFunction } from "express";

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

export default router;
