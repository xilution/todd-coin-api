import { Server } from "@hapi/hapi";
import { getRoot } from "../handlers/root-handlers";
import { ApiSettings } from "../types";
import { DbClient } from "@xilution/todd-coin-brokers";

export const addRootRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/",
    options: {
      tags: ["api"],
    },
    handler: getRoot(dbClient, apiSettings),
  });
};
