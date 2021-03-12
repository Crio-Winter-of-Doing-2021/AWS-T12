interface loginInfo {
  username: string;
  password: string;
}

export type User = {
  name: string;
  email: string;
};

export const isBrowser = () => typeof window !== "undefined";

export const getUser = (): User | {} =>
  window.localStorage.gatsbyUser
    ? JSON.parse(window.localStorage.gatsbyUser)
    : {};

const setUser = (user: User | {}) =>
  window.localStorage.setItem("gatsbyUser", JSON.stringify(user));

export const handleLogin = ({ username, password }: loginInfo) => {
  if (!isBrowser()) return false;

  if (username === `john` && password === `pass`) {
    return setUser({
      name: `Johnny`,
      email: `johnny@example.org`,
    });
  }

  return false;
};

export const isLoggedIn = () => {
  if (!isBrowser()) return false;
  const user = getUser();

  return "email" in user;
};

export const getCurrentUser = (): User | {} => isBrowser() && getUser();

export const logout = (callback: Function) => {
  if (!isBrowser()) return;

  setUser({});
  callback();
};
