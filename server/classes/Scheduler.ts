import TaskModel from "../models/Task";

export const schedule = async (taskURL: string, delayInMS: number) => {
  // Create the task object in the database
  const createdTask = await TaskModel.create({
    taskURL: taskURL,
    delayInMS: delayInMS,
    status: "scheduled",
  });

  return createdTask._id;
};
