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
} from "./orchestrator.module.css";

const API_URL = process.env.API_URL;
if (!API_URL) {
  throw new Error(
    ".env is missing the definition of an API_URL environment variable"
  );
}

type FormData = {
  title?: string;
  firstTaskURL?: string;
  scheduledTime?: string;
  conditionCheckTaskURL?: string;
  conditionCheckDelayInMS?: number;
  conditionCheckRetries?: number;
  timeDelayBetweenRetriesInMS?: number;
  fallbackTaskURL?: string;
  secondTaskURL?: string;
};

type FormDataErrors = {
  title?: string;
  firstTaskURL?: string;
  scheduledTime?: string;
  conditionCheckTaskURL?: string;
  conditionCheckDelayInMS?: string;
  conditionCheckRetries?: string;
  timeDelayBetweenRetriesInMS?: string;
  fallbackTaskURL?: string;
  secondTaskURL?: string;
};

const getDelayFromNowInMS = (timeString: string) => {
  let futureTime = new Date(timeString);
  return futureTime.getTime() - Date.now();
};

const Orchestrator = () => {
  return (
    <View title="Schedule an Orchestration">
      <Formik
        initialValues={{
          title: "",
          firstTaskURL: "",
          scheduledTime: "",
          conditionCheckTaskURL: "",
          conditionCheckDelayInMS: undefined,
          conditionCheckRetries: undefined,
          timeDelayBetweenRetriesInMS: undefined,
          fallbackTaskURL: "",
          secondTaskURL: "",
        }}
        onSubmit={async (values, actions) => {
          const jsonResponse = await fetch(`${API_URL}/orchestrations`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${getAccessToken()}`,
            },
            body: JSON.stringify({
              title: values.title,
              firstTaskURL: values.firstTaskURL,
              conditionCheckTaskURL: values.conditionCheckTaskURL,
              fallbackTaskURL: values.fallbackTaskURL,
              secondTaskURL: values.secondTaskURL,
              initialDelayInMS: getDelayFromNowInMS(values.scheduledTime),
              conditionCheckDelayInMS: parseInt(
                (values.conditionCheckDelayInMS ?? 0).toString(10),
                10
              ),
              conditionCheckRetries: parseInt(
                (values.conditionCheckRetries ?? 0).toString(10),
                10
              ),
              timeDelayBetweenRetriesInMS: parseInt(
                (values.timeDelayBetweenRetriesInMS ?? 0).toString(10),
                10
              ),
            }),
          });

          if (jsonResponse.status >= 400) {
            console.error(await jsonResponse.json());
            return;
          }

          const id = await jsonResponse.json();

          actions.setSubmitting(false);
          navigate(`/app/orchestration/${id}`);
        }}
        validate={(values: FormData) => {
          const errors: FormDataErrors = {};
          if (!values.title) {
            errors.title = "Title Required";
          }
          if (!values.firstTaskURL) {
            errors.firstTaskURL = "First Task URL Required";
          }
          if (!values.secondTaskURL) {
            errors.secondTaskURL = "Second Task URL Required";
          }
          if (!values.fallbackTaskURL) {
            errors.fallbackTaskURL = "Fallback Task URL Required";
          }
          if (!values.conditionCheckTaskURL) {
            errors.conditionCheckTaskURL = "Condition Check Task URL Required";
          }
          if (!values.scheduledTime) {
            errors.scheduledTime = "Scheduled time is Required";
          } else {
            if (getDelayFromNowInMS(values.scheduledTime) < 0) {
              errors.scheduledTime = "Scheduled time needs to be in the future";
            }
          }
          //           if (
          //             values.retryCount === undefined ||
          //             values.retryCount.toString(10) == ""
          //           ) {
          //             errors.retryCount = "No. of retries is needed";
          //           } else if (values.retryCount < 0) {
          //             errors.retryCount = "No of retries should be non-negative";
          //           } else if (values.retryCount > 0) {
          //             if (
          //               values.retryDelayInMS === undefined ||
          //               values.retryDelayInMS.toString(10) == ""
          //             ) {
          //               errors.retryDelayInMS = "Retry delay is needed";
          //             } else if (values.retryDelayInMS < 0) {
          //               errors.retryDelayInMS = "Retry delay should be non-negative";
          //             }
          //           }
          return errors;
        }}
      >
        {({ values, handleChange }) => (
          <Form className={baseForm}>
            <Field name="title" className={formInput} placeholder="Title" />
            <ErrorMessage name="title">
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
              name="firstTaskURL"
              className={formInput}
              placeholder="First Task URL"
            />
            <ErrorMessage name="firstTaskURL">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            <Field
              name="conditionCheckDelayInMS"
              className={formInput}
              type="number"
              placeholder="Condition Check delay (in ms)"
            />
            <ErrorMessage name="conditionCheckDelayInMS">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            <Field
              name="conditionCheckTaskURL"
              className={formInput}
              placeholder="Condition Check Task URL"
            />
            <ErrorMessage name="conditionCheckTaskURL">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            <Field
              name="conditionCheckRetries"
              className={formInput}
              placeholder="# of Retries for Condition check"
              type="number"
            />
            <ErrorMessage name="conditionCheckRetries">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            <Field
              name="timeDelayBetweenRetriesInMS"
              className={formInput}
              placeholder="Delay between Retries for Condition check (in ms)"
              type="number"
            />
            <ErrorMessage name="timeDelayBetweenRetriesInMS">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            <Field
              name="secondTaskURL"
              className={formInput}
              placeholder="Second Task URL"
            />
            <ErrorMessage name="secondTaskURL">
              {(msg) => <div className={formError}>*{msg}</div>}
            </ErrorMessage>

            <Field
              name="fallbackTaskURL"
              className={formInput}
              placeholder="Fallback Task URL"
            />
            <ErrorMessage name="fallbackTaskURL">
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

export default Orchestrator;
