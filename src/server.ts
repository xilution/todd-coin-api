"use strict";

import * as Hapi from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import { DbClient, environmentUtils } from "@xilution/todd-coin-brokers";
import { getApiSettings } from "./environment-utils";
import { addRoutes } from "./routes";
import { addAuth } from "./handlers/auth";

// todo - unit tests
// todo - mobile app
// todo - add update participant
// todo - add update node
// todo - add update pending transactions - for canceling them
// todo - add a organization resource (to track charities) and a participant-organization association (name, address, email, url, phone number, role, etc.)
// todo - add github contribution and pull request template files
// todo - write a regression test suite
// todo - create separate docker tasks for synchronization and mining
// todo - set up slack channel
// todo - set up a landing page with how to instructions
// todo - open api spec (swagger) hosted from deployed API

export let server: Server;

export const init = async (): Promise<Server> => {
  const dbClient = new DbClient();
  const { database, username, password, dbHost, dbPort } =
    environmentUtils.getDatabaseSettings();

  await dbClient.init(database, username, password, dbHost, dbPort);

  const apiSettings = getApiSettings();
  const { apiPort, apiHost } = apiSettings;

  server = Hapi.server({
    port: apiPort,
    host: apiHost,
    routes: {
      cors: true,
    },
  });

  addAuth(server, dbClient, apiSettings);

  addRoutes(server, dbClient, apiSettings);

  return server;
};

export const start = async (): Promise<void> => {
  console.log(`Listening on ${server.settings.host}:${server.settings.port}`);
  return server.start();
};

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection");
  console.error(err);
  process.exit(1);
});
