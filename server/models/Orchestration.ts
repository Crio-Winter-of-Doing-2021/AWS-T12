import { Schema, model, Model, Document } from "mongoose";

export type OrchestrationStatus =
  | "scheduled"
  | "running"
  | "completed-second"
  | "completed-fallback"
  | "failed-first"
  | "failed-condition"
  | "failed-second"
  | "failed-fallback"
  | "cancelled";

// Interface for Orchestration Schema
// corresponding type declaration present in client side in
// /client/src/components/...
export interface OrchestrationDocument extends Document {
  _id: string;
  title: string;
  firstTaskURL: string;
  initialDelayInMS: number;
  status: OrchestrationStatus;
  conditionCheckTaskURL: string;
  conditionCheckDelayInMS: number;
  conditionCheckRetries: number;
  timeDelayBetweenRetriesInMS: number;
  fallbackTaskURL: string;
  secondTaskURL: string;
  creatorEmail: string;
  updatedAt: Date;
  actualConditionCheckTryCount: number;
}

// For model type
export interface OrchestrationModelInterface
  extends Model<OrchestrationDocument> {}

// create schema for Orchestration
const OrchestrationSchema = new Schema<
  OrchestrationDocument,
  OrchestrationModelInterface
>({
  firstTaskURL: {
    type: String,
    required: [true, "The Orchestration's first task URL is required"],
  },
  conditionCheckTaskURL: {
    type: String,
    required: [
      true,
      "The Orchestration's condition check task URL is required",
    ],
  },
  fallbackTaskURL: {
    type: String,
    required: [true, "The Orchestration's fallback task URL is required"],
  },
  SecondTaskURL: {
    type: String,
    required: [true, "The Orchestration's second task URL is required"],
  },
  initialDelayInMS: {
    type: Number,
    required: [true, "The Orchestration's initial delay is required"],
  },
  status: {
    type: String,
    enum: ["scheduled", "running", "completed", "failed", "cancelled"],
    default: "scheduled",
  },
  title: {
    type: String,
    default: "#No Title",
  },
  updatedAt: Date,
  creatorEmail: {
    type: String,
    default: "unspecified",
  },
  //   response: {
  //     status: { type: Number, default: null },
  //     body: { type: String, default: "" },
  //   },
  conditionCheckRetries: {
    type: Number,
    default: 0,
  },
  conditionCheckDelayInMS: {
    type: Number,
    default: 0,
  },
  timeDelayBetweenRetriesInMS: {
    type: Number,
    default: 0,
  },
  actualConditionCheckTryCount: {
    type: Number,
    default: 0,
  },
});

// create model for Orchestrations
const OrchestrationModel: Model<OrchestrationDocument> = model(
  "Orchestration",
  OrchestrationSchema,
  "Orchestrations"
);

export default OrchestrationModel;
