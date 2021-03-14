import TaskModel, { TaskStatus } from "../models/Task";

export const retrieveAllTasks = async () => {
  const tasks = TaskModel.find().sort({ createdAt: -1 });
  return tasks;
};

export const retrieveAllTasksPaginated = async (
  limit: number,
  offset: number
) => {
  const tasks = TaskModel.find()
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
  return tasks;
};

export const retrieveTaskInstances = async (status: TaskStatus) => {
  const tasks = TaskModel.find({ status: status }).sort({ createdAt: -1 });
  return tasks;
};

export const retrieveTaskInstancesPaginated = async (
  status: TaskStatus,
  limit: number,
  offset: number
) => {
  const tasks = TaskModel.find({ status: status })
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);
  return tasks;
};

export const schedule = async (taskURL: string, delayInMS: number) => {
  // Create the task object in the database
  const createdTask = await TaskModel.create({
    taskURL: taskURL,
    delayInMS: delayInMS,
    status: "scheduled",
  });

  return createdTask._id;
};
