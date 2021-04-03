import React, { useEffect, useReducer } from "react";
import View from "../View";
import { getProfile, getAccessToken } from "../../services/auth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { navigate } from "gatsby";
import {
  formError,
  formInput,
  baseForm,
  scheduleButton,
} from "./taskscheduler.module.css";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error(
    ".env is missing the definition of an API_URL environment variable"
  );
}

type FormData = {
  title?: string;
  taskURL?: string;
  scheduledTime?: string;
  retryCount?: number;
  retryDelayInMS?: number;
};

type FormDataErrors = {
  title?: string;
  taskURL?: string;
  scheduledTime?: string;
  retryCount?: string;
  retryDelayInMS?: string;
};

const getDelayFromNowInMS = (timeString: string) => {
  let futureTime = new Date(timeString);
  return futureTime.getTime() - Date.now();
};

const TaskScheduler = () => {
  const currentUser = getProfile();

  if (!("email" in currentUser)) {
    return null;
  }

  return (
    <View title="Schedule a Task">
      <Formik
        initialValues={{
          title: "",
          taskURL: "",
          scheduledTime: "",
          retryCount: undefined,
          retryDelayInMS: undefined,
        }}
        onSubmit={async (values, actions) => {
          const jsonResponse = await fetch(`${API_URL}/tasks`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${getAccessToken()}`,
            },
            body: JSON.stringify({
              title: values.title,
              taskURL: values.taskURL,
              delayInMS: getDelayFromNowInMS(values.scheduledTime),
              retryCount: values.retryCount,
              retryDelayInMS: values.retryDelayInMS,
            }),
          });

          if (jsonResponse.status >= 400) {
            console.error(await jsonResponse.json());
            return;
          }

          const id = await jsonResponse.json();

          actions.setSubmitting(false);
          navigate(`/app/task/${id}`);
        }}
        validate={(values: FormData) => {
          const errors: FormDataErrors = {};
          if (!values.title) {
            errors.title = "Title Required";
          }
          if (!values.taskURL) {
            errors.taskURL = "Task URL Required";
          }
          if (!values.scheduledTime) {
            errors.scheduledTime = "Scheduled time is Required";
          } else {
            if (getDelayFromNowInMS(values.scheduledTime) < 0) {
              errors.scheduledTime = "Scheduled time needs to be in the future";
            }
          }
          if (
            values.retryCount === undefined ||
            values.retryCount.toString(10) == ""
          ) {
            errors.retryCount = "No. of retries is needed";
          } else if (values.retryCount < 0) {
            errors.retryCount = "No of retries should be non-negative";
          } else if (values.retryCount > 0) {
            if (
              values.retryDelayInMS === undefined ||
              values.retryDelayInMS.toString(10) == ""
            ) {
              errors.retryDelayInMS = "Retry delay is needed";
            } else if (values.retryDelayInMS < 0) {
              errors.retryDelayInMS = "Retry delay should be non-negative";
            }
          }
          return errors;
        }}
      >
        {({ values, handleChange }) => (
          <Form className={baseForm}>
            <Field name="title" className={formInput} placeholder="Title" />
            <ErrorMessage name="title">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            <Field
              name="taskURL"
              className={formInput}
              placeholder="Task URL"
            />
            <ErrorMessage name="taskURL">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            <input
              value={values.scheduledTime}
              name="scheduledTime"
              className={formInput}
              type="datetime-local"
              onChange={handleChange}
            />
            <ErrorMessage name="scheduledTime">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            <Field
              name="retryCount"
              className={formInput}
              placeholder="# of Retries"
            />
            <ErrorMessage name="retryCount">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            {parseInt(values.retryCount ?? "0", 10) > 0 && (
              <>
                <Field
                  name="retryDelayInMS"
                  className={formInput}
                  placeholder="Delay between retries (in ms)"
                />
                <ErrorMessage name="retryDelayInMS">
                  {(msg) => <div className={formError}>*{msg}</div>}
                </ErrorMessage>
              </>
            )}

            <button type="submit" className={scheduleButton}>
              Schedule
            </button>
          </Form>
        )}
      </Formik>
    </View>
  );
};

export default TaskScheduler;
