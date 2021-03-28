import { Schema, model, Model, Document } from "mongoose";

export type TaskStatus =
  | "scheduled"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

// Interface for Task Schema
// corresponding type declaration present in client side in
// /client/src/components/TaskBox/index.tsx
export interface TaskDocument extends Document {
  _id: string;
  title: string;
  taskURL: string;
  delayInMS: number;
  status: TaskStatus;
  updatedAt: Date;
  creatorEmail: string;
  response: {
    status: null | number;
    body: string;
  };
  // retryCount: number;
  // retryDelayInMS: number;
}

// For model type
export interface TaskModelInterface extends Model<TaskDocument> {}

// create schema for Task
const TaskSchema = new Schema<TaskDocument, TaskModelInterface>({
  taskURL: {
    type: String,
    required: [true, "The Task URL is required"],
  },
  delayInMS: {
    type: Number,
    required: [true, "The Task delay is required"],
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
  response: {
    status: { type: Number, default: null },
    body: { type: String, default: "" },
  },
});

// create model for Tasks
const TaskModel: Model<TaskDocument> = model("Task", TaskSchema, "Tasks");

export default TaskModel;
