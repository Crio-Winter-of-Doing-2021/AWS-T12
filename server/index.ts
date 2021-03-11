import express from "express";
import { json } from "body-parser";
import cors from "cors";
import routes from "./routes";

require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

if (process.env.NODE_ENV === "Development") {
  // // Set mongoose to debug mode
  // mongoose.set("debug", true);

  // Add morgan for request-response logs
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

app.use(cors());
app.use(json());

app.use("/", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
