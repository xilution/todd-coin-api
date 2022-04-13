import { Server } from "@hapi/hapi";
import { AUTH_SCHEMA } from "./validation-schemas";
import {
  authTokenRequestHandler,
  authTokenValidationFailAction,
} from "../handlers/auth-handlers";
import { DbClient } from "@xilution/todd-coin-brokers";
import { ApiSettings } from "../types";

export const addAuthRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "POST",
    path: "/auth/token",
    options: {
      validate: {
        payload: AUTH_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: authTokenValidationFailAction,
      },
    },
    handler: authTokenRequestHandler(dbClient, apiSettings),
  });
};
