"use strict";

import * as Hapi from "@hapi/hapi";
import * as Inert from "@hapi/inert";
import * as Vision from "@hapi/vision";
import * as HapiSwagger from "hapi-swagger";
import { Server } from "@hapi/hapi";
import { DbClient, environmentUtils } from "@xilution/todd-coin-brokers";
import { getApiSettings } from "./environment-utils";
import { addRoutes } from "./routes";
import { addAuth } from "./handlers/auth";
import { createPlugin } from "@promster/hapi";

// todo - unit tests
// todo - mobile app
// todo - add update participant endpoint
// todo - add update node endpoint
// todo - add update pending transactions endpoint - for canceling them
// todo - add participant keys endpoints
// todo - add participant-organization association (name, address, email, url, phone number, role, etc.)
// todo - add github contribution and pull request template files
// todo - write a regression test suite
// todo - set up slack channel
// todo - set up a landing page with how to instructions
// todo - open api spec (swagger) hosted from deployed API
// todo - prometheus and graphana metrics
// todo - posting a participant or org shouldn't require authentication

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

  const swaggerOptions = {
    info: {
      title: "Todd Coin API Documentation",
    },
  };

  // todo - fix this typing
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const plugins: Array<Hapi.ServerRegisterPluginObject<any>> = [
    {
      plugin: Inert,
    },
    {
      plugin: Vision,
    },
    {
      plugin: HapiSwagger,
      options: swaggerOptions,
    },
  ];

  await server.register(plugins);

  await server.register(createPlugin({}));

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
