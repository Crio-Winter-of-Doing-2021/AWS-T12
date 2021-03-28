import React, { useEffect, useReducer } from "react";
import View from "../View";
import { getProfile, getAccessToken } from "../../services/auth";
import { Formik, Form, Field, ErrorMessage } from "formik";
import DateTimePicker from "react-datetime-picker";
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

  const { name } = currentUser;

  return (
    <View title="Schedule a Task">
      <Formik
        initialValues={{
          title: "",
          taskURL: "",
          scheduledTime: "",
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
          const errors: FormData = {};
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
