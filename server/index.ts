import express, { NextFunction, Request, Response } from "express";
import { json } from "body-parser";
import cors from "cors";
import routes from "./routes";

import { clientOrigins, port } from "./config/env.dev";

require("dotenv").config();

const app = express();
app.use(cors({ origin: clientOrigins }));

if (process.env.NODE_ENV === "Development") {
  // // Set mongoose to debug mode
  // mongoose.set("debug", true);

  // Add morgan for request-response logs
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

app.use(json());

app.use("/", routes);

app.use(function (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.log(err);
  res.status(500).send(err.message);
});

app.listen(port, () => {
  console.log(`API Server running on port ${port}`);
});
