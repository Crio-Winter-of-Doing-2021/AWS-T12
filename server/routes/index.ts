import express from "express";

import tasksRouter from "./tasks";
import orchestrationsRouter from "./orchestrations";

const router = express.Router();

router.use("/tasks", tasksRouter);
router.use("/orchestrations", orchestrationsRouter);

export default router;
