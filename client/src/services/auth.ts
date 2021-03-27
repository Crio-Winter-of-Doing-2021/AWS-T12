import { WebAuth } from "auth0-js";
import { navigate } from "gatsby";

const isBrowser = typeof window !== "undefined";

const auth = new WebAuth({
  audience: process.env.AUTH0_AUDIENCE ?? "",
  domain: process.env.AUTH0_DOMAIN ?? "",
  clientID: process.env.AUTH0_CLIENTID ?? "",
  redirectUri: process.env.AUTH0_CALLBACK,
  responseType: "token id_token",
  scope: "openid profile email",
});

type TokenType = {
  accessToken: string | false;
  idToken: string | false;
  expiresAt: number | false;
};

let tokens: TokenType = {
  accessToken: false,
  idToken: false,
  expiresAt: false,
};

let user:
  | {}
  | {
      email: string;
      name: string;
    } = {};

export const isAuthenticated = () => {
  if (!isBrowser) {
    return;
  }

  return localStorage.getItem("isLoggedIn") === "true";
};

export const login = () => {
  if (!isBrowser) {
    return;
  }

  auth.authorize();
};

const setSession = (cb = () => {}) => (err, authResult) => {
  if (err) {
    navigate("/");
    cb();
    return;
  }

  if (authResult && authResult.accessToken && authResult.idToken) {
    tokens.accessToken = authResult.accessToken;
    tokens.idToken = authResult.idToken;
    if (authResult.expiresIn) {
      tokens.expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
    }
    user = authResult.idTokenPayload;
    localStorage.setItem("isLoggedIn", "true");
    navigate("/app/tasks");
    cb();
  }
};

export const handleAuthentication = () => {
  if (!isBrowser) {
    return;
  }

  auth.parseHash(setSession());
};

export const getProfile = () => {
  return user;
};

export const silentAuth = (callback: () => void) => {
  if (!isAuthenticated()) return callback();
  auth.checkSession(
    {
      state: window.location.pathname + window.location.search,
    },
    setSession(callback)
  );
};

export const logout = () => {
  auth.logout({ returnTo: "" });
  localStorage.setItem("isLoggedIn", "false");
};

export const getAccessToken = () => tokens.accessToken;
