import TaskModel, { TaskStatus, TaskDocument } from "../models/Task";
import fetch from "node-fetch";

import { scheduleJob } from "node-schedule";

let jobs = {};

export const retrieveAllTasks = async () => {
  const tasks = await TaskModel.find().sort({ updatedAt: -1 });
  return tasks;
};

export const retrieveAllUserTasks = async (email: string) => {
  const tasks = TaskModel.find({ creatorEmail: email }).sort({ updatedAt: -1 });
  return tasks;
};

export const retrieveAllTasksPaginated = async (
  limit: number,
  offset: number
) => {
  const tasks = await TaskModel.find()
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit);
  return tasks;
};

export const retrieveAllUserTasksPaginated = async (
  email: string,
  limit: number,
  offset: number
) => {
  const tasks = await TaskModel.find({ creatorEmail: email })
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit);
  return tasks;
};

export const retrieveTaskInstances = async (status: TaskStatus) => {
  const tasks = await TaskModel.find({ status: status }).sort({
    updatedAt: -1,
  });
  return tasks;
};

export const retrieveUserTaskInstances = async (
  email: string,
  status: TaskStatus
) => {
  const tasks = await TaskModel.find({
    creatorEmail: email,
    status: status,
  }).sort({
    updatedAt: -1,
  });
  return tasks;
};

export const retrieveTaskInstance = async (taskId: string) => {
  try {
    const task = await TaskModel.findOne({ _id: taskId });
    return task;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const retrieveTaskInstancesPaginated = async (
  status: TaskStatus,
  limit: number,
  offset: number
) => {
  const tasks = await TaskModel.find({ status: status })
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit);
  return tasks;
};

export const retrieveUserTaskInstancesPaginated = async (
  email: string,
  status: TaskStatus,
  limit: number,
  offset: number
) => {
  const tasks = await TaskModel.find({ creatorEmail: email, status: status })
    .sort({ updatedAt: -1 })
    .skip(offset)
    .limit(limit);
  return tasks;
};

const updateTaskStatus = async (taskId: string, status: TaskStatus) => {
  try {
    await TaskModel.findOneAndUpdate(
      { _id: taskId },
      { status: status },
      { new: true }
    );
  } catch (e) {
    console.error(e);
    return false;
  }

  return true;
};

export const cancel = async (taskId: string) => {
  if (taskId in jobs) {
    jobs[taskId].cancel();
    delete jobs[taskId];
  }

  return updateTaskStatus(taskId, "cancelled");
};

export const modify = async (taskId: string, delayInMS: number) => {
  if (delayInMS < 0) return false;

  if (taskId in jobs) {
    jobs[taskId].cancel();
    delete jobs[taskId];
  }

  try {
    const modifiedTask = await TaskModel.findOneAndUpdate(
      { _id: taskId, delayInMS: delayInMS },
      { new: true }
    );

    if (delayInMS == 0) {
      const taskPerformer = getTaskPerformer(modifiedTask);
      taskPerformer();
    } else {
      const jobTime = new Date(Date.now() + delayInMS);
      jobs[modifiedTask._id] = scheduleJob(
        jobTime,
        getTaskPerformer(modifiedTask)
      );
    }
  } catch (e) {
    console.error(e);
    return false;
  }
};

const getTaskPerformer = (task: TaskDocument) => {
  const taskPerformer = async () => {
    await updateTaskStatus(task._id, "running");

    const response = await fetch(task.taskURL, {
      method: "GET",
    });

    if (response.status >= 200 && response.status < 300) {
      await updateTaskStatus(task._id, "completed");
    } else {
      await updateTaskStatus(task._id, "failed");
    }

    delete jobs[task._id];
  };

  return taskPerformer;
};

export const schedule = async (
  creatorEmail: string,
  title: string,
  taskURL: string,
  delayInMS: number
) => {
  // If delay is negative, return null
  if (delayInMS < 0) return null;

  // Create the task object in the database
  const createdTask = await TaskModel.create({
    creatorEmail: creatorEmail,
    title: title,
    taskURL: taskURL,
    delayInMS: delayInMS,
    status: "scheduled",
  });

  if (delayInMS == 0) {
    const taskPerformer = getTaskPerformer(createdTask);
    taskPerformer();
  } else {
    const jobTime = new Date(Date.now() + delayInMS);
    jobs[createdTask._id] = scheduleJob(jobTime, getTaskPerformer(createdTask));
  }

  return createdTask._id;
};

// Function to refresh node-schedule on server startup
export const refreshScheduler = async () => {
  // For tasks which were in running state (meaning the server failed
  // during their run), since we do not
  // know their fate, we update their status to failed
  // to be on the safe side
  const runningTasks = await retrieveTaskInstances("running");

  for (let task of runningTasks) {
    updateTaskStatus(task._id, "cancelled");
  }

  // Check previously scheduled tasks
  const scheduledTasks = await retrieveTaskInstances("scheduled");

  jobs = {};

  for (let task of scheduledTasks) {
    const taskTime = task.updatedAt.getTime() + task.delayInMS;
    const delayFromNow = taskTime - Date.now();

    if (delayFromNow < 0) {
      // Task's scheduled time has passed, so they must be updated to cancelled
      // status
      updateTaskStatus(task._id, "cancelled");
    } else {
      // re-add the tasks to node-schedule
      const jobTime = new Date(Date.now() + delayFromNow);
      jobs[task._id] = scheduleJob(jobTime, getTaskPerformer(task));
    }
  }
};
