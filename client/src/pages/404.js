import React from "react";
import Layout from "../components/Layout";
import View from "../components/View";
import Status from "../components/Status";

const NotFound = () => (
  <Layout>
    <Status />
    <View title="Not Found">
      <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    </View>
  </Layout>
);

export default NotFound;
