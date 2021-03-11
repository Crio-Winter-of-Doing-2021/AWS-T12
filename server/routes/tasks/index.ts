import express, { Request, Response, NextFunction } from "express";

const router = express.Router();

// GET / - fetches list of tasks of the signed in user
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json([]);
});

export default router;
