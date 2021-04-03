import express, { NextFunction, Request, Response } from "express";
import { json } from "body-parser";
import cors from "cors";
import mongoose from "mongoose";

import routes from "./routes";
import { clientOrigins, port, DB, NODE_ENV } from "./config/env.dev";
import { refreshScheduler } from "./classes/Scheduler";

require("dotenv").config();

const app = express();
app.use(cors({ origin: clientOrigins }));

// Connect to the database
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Database connected successfully"))
  .catch((err) => console.log(err));

if (NODE_ENV === "Development") {
  // Set mongoose to debug mode
  mongoose.set("debug", true);

  // Add morgan for request-response logs
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

refreshScheduler();

app.use(json());

app.use("/", routes);

app.use(function (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);
  res
    .status(err["status"] || 500)
    .send("Internal Server Error. Contact arijitbiley@gmail.com");
});

app.listen(port, () => {
  console.log(`API Server running on port ${port}`);
});
