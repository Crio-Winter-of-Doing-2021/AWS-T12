require("dotenv").config();

export const audience = process.env.AUTH0_AUDIENCE;
export const domain = process.env.AUTH0_DOMAIN;
export const port = process.env.SERVER_PORT;
export const clientOriginUrl = process.env.CLIENT_ORIGIN_URL;
export const DB = process.env.DB;
export const NODE_ENV = process.env.NODE_ENV ?? "Production";

if (!audience) {
  throw new Error(
    ".env is missing the definition of an AUTH0_AUDIENCE environmental variable"
  );
}

if (!domain) {
  throw new Error(
    ".env is missing the definition of an AUTH0_DOMAIN environmental variable"
  );
}

if (!port) {
  throw new Error(
    ".env is missing the definition of a SERVER_PORT environmental variable"
  );
}

if (!clientOriginUrl) {
  throw new Error(
    ".env is missing the definition of a CLIENT_ORIGIN_URL environmental variable"
  );
}

if (!DB) {
  throw new Error(".env is missing the definition of DB environment variable");
}

export const clientOrigins = [clientOriginUrl];
