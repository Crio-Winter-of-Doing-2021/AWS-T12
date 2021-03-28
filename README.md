# Task Scheduler for AWS Lambda Functions
Team ID: `AWS-T12`

Team Members:
- [Arijit Saha](https://github.com/TheArijitSaha)
- [Rohit Kumar](https://github.com/IamRo45)

## Current TODOs

- [ ] Add query parameters for AWS Lambda
- [ ] Add recall times (maybe not enough time)

## Task

Each task instance has the following properties:

- `id`: ID that uniquely identifies a Task instance.
- `taskURL`: The AWS Lambda Trigger API URL to be called.
- `delayInMS`: The delay in milliseconds that taken into account from the creation time will give the scheduled run time.
- `createdAt`: Timestamp storing the creation time of task instance.
- `status`: A Task instance can be one of the following:
  - <span style="margin:2px;padding:2px;background-color:dodgerblue; border-radius:3px">Scheduled</span>
  - <span style="margin:2px;padding:2px;background-color:goldenrod; border-radius:3px">Running</span>
  - <span style="margin:2px;padding:2px;background-color:green; border-radius:3px">Completed (Success)</span>
  - <span style="margin:2px;padding:2px;background-color:maroon; border-radius:3px">Failed</span>
  - <span style="margin:2px;padding:2px;background-color:black;border-radius:3px">Cancelled</span>

## Functionality

The Task Scheduler Library supports REST API endpoints which support the following functionality. Users can use these endpoints to schedule, retrieve, modify and cancel tasks (lambda functions).

- [x] `TaskId schedule(TaskURL, timeInMS)`

  - **Description:** Schedules a Task after an initial delay of timeInMS and returns the created Task Instance Id.
  - **API Endpoint:** `POST`: `/tasks` (Protected API Route)


- [x] `Boolean cancel(Taskid)`

  - **Description:** Takes in a Task Instance Id and cancels it. Returns a boolean value to confirm the task has been cancelled.
  - **API Endpoint:** `PUT`: `/tasks/<id>/cancel` (Protected API Route)


- [x] `TaskStatus checkStatus(Taskid)`

  - **Description:** Returns the status of the task instance.
  - **API Endpoint:** `GET`: `/tasks/:taskID/status`


- [x] `Boolean modify(TaskId, timeInMS)`

  - **Description:** Takes in a Task Instance Id and a new time delay and updates the task’s schedule to the new one. Return a boolean value to indicate a successful modification.
  - **API Endpoint:** `PATCH`: `/tasks/<id>` (Protected API Route)


- [x] `Task[] retrieveTaskInstances(TaskStatus)`

  - **Description:** Return list of all Task instances with a specific status.
  - **API Endpoint:** `GET`: `/tasks?status=<filterStatus>`


- [x] `Task[] retrieveAllTasks()`

  - **Description:** Retrieves all tasks, irrespective of status.
  - **API Endpoint:** `GET`: `/tasks`
