import { Server } from "@hapi/hapi";
import {
  authTokenRequestHandler,
  authTokenValidationFailAction,
  authUserRequestHandler,
  authUserValidationFailAction,
} from "../handlers/auth-handlers";
import { DbClient } from "@xilution/todd-coin-brokers";
import { ApiSettings } from "../types";
import {
  AUTH_TOKEN_RESPONSE_SCHEMA,
  ERROR_RESPONSE_SCHEMA,
  GET_PARTICIPANT_RESPONSE_SCHEMA,
} from "./response-schemas";
import { AUTH_TOKEN_DESCRIPTION, AUTH_USER_DESCRIPTION } from "./messages";
import { AUTH_TOKEN_REQUEST_SCHEMA } from "./request-schemas";

export const addAuthRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "POST",
    path: "/auth/token",
    options: {
      description: AUTH_TOKEN_DESCRIPTION,
      tags: ["api"],
      validate: {
        payload: AUTH_TOKEN_REQUEST_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: authTokenValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: AUTH_TOKEN_RESPONSE_SCHEMA,
            },
            400: {
              description: "Bad Request",
              schema: ERROR_RESPONSE_SCHEMA,
            },
            500: {
              description: "Internal Server Error",
              schema: ERROR_RESPONSE_SCHEMA,
            },
          },
        },
      },
    },
    handler: authTokenRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/auth/userinfo",
    options: {
      description: AUTH_USER_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        options: {
          abortEarly: false,
        },
        failAction: authUserValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_PARTICIPANT_RESPONSE_SCHEMA,
            },
            400: {
              description: "Bad Request",
              schema: ERROR_RESPONSE_SCHEMA,
            },
            500: {
              description: "Internal Server Error",
              schema: ERROR_RESPONSE_SCHEMA,
            },
          },
        },
      },
    },
    handler: authUserRequestHandler(dbClient, apiSettings),
  });
};
