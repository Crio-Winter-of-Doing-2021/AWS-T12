import React from "react";
import View from "./View";
import { getCurrentUser } from "../services/auth";

const Profile = () => {
  const currentUser = getCurrentUser();

  if (!("email" in currentUser)) {
    return null;
  }

  const { name } = currentUser;

  return (
    <View title="Your Profile">
      <p>Welcome back to your profile, {name}!</p>
      <p>
        This is a client-only route. You could set up a form to save information
        about a user here.
      </p>
    </View>
  );
};

export default Profile;
