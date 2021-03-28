import React from "react";
import { Link } from "gatsby";
import Layout from "../components/Layout";
import View from "../components/View";
import Status from "../components/Status";

const Index = () => (
  <Layout>
    <Status />
    <View title="AWS Lambda Task Scheduler App">
      <p>This is a task scheduler that helps you schedule Lambda functions.</p>
      <p>
        This is made as a CWoD project by team <code>AWS-T12</code>, whose
        members are <code>Arijit Saha</code> (and , <code>Rohit Kumar</code>).
      </p>
      <p>
        For the full experience, go to
        {` `}
        <Link to="/app/tasks">your tasks</Link>.
      </p>
    </View>
  </Layout>
);

export default Index;
