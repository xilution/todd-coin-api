import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_NODE_PARAMETERS_SCHEMA,
  GET_NODES_QUERY_SCHEMA,
  PATCH_NODE_SCHEMA,
  POST_NODE_SCHEMA,
} from "./validation-schemas";
import {
  getNodeRequestHandler,
  getNodesRequestHandler,
  getNodesValidationFailAction,
  getNodeValidationFailAction,
  patchNodeRequestHandler,
  patchNodeValidationFailAction,
  postNodeRequestHandler,
  postNodeValidationFailAction,
} from "../handlers/node-handlers";
import { ApiSettings } from "../types";

export const addNodesRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/nodes",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        query: GET_NODES_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getNodesValidationFailAction,
      },
    },
    handler: getNodesRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/nodes/{nodeId}",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_NODE_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getNodeValidationFailAction,
      },
    },
    handler: getNodeRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/nodes",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        payload: POST_NODE_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postNodeValidationFailAction,
      },
    },
    handler: postNodeRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/nodes/{nodeId}",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_NODE_PARAMETERS_SCHEMA,
        payload: PATCH_NODE_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchNodeValidationFailAction,
      },
    },
    handler: patchNodeRequestHandler(dbClient),
  });
};
