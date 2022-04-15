import { authenticationScheme } from "./authentication-scheme";
import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import { ApiSettings } from "../../types";

export const addAuth = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
) => {
  server.auth.scheme("custom", authenticationScheme(dbClient, apiSettings));

  server.auth.strategy("custom", "custom");
};
