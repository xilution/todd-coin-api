import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  GET_NODE_PARAMETERS_SCHEMA,
  GET_NODES_QUERY_SCHEMA,
  PATCH_NODE_REQUEST_SCHEMA,
  POST_NODE_REQUEST_SCHEMA,
} from "./request-schemas";
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
import {
  GET_NODE_RESPONSE_SCHEMA,
  GET_NODES_RESPONSE_SCHEMA,
  POST_NODE_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  GET_NODE_DESCRIPTION,
  GET_NODES_DESCRIPTION,
  PATCH_NODE_DESCRIPTION,
  POST_NODE_DESCRIPTION,
} from "./messages";

export const addNodesRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/nodes",
    options: {
      description: GET_NODES_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        query: GET_NODES_QUERY_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getNodesValidationFailAction,
      },
      response: {
        schema: GET_NODES_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getNodesRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/nodes/{nodeId}",
    options: {
      description: GET_NODE_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_NODE_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getNodeValidationFailAction,
      },
      response: {
        schema: GET_NODE_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getNodeRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/nodes",
    options: {
      description: POST_NODE_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        payload: POST_NODE_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postNodeValidationFailAction,
      },
      response: {
        schema: POST_NODE_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: postNodeRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/nodes/{nodeId}",
    options: {
      description: PATCH_NODE_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_NODE_PARAMETERS_SCHEMA,
        payload: PATCH_NODE_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchNodeValidationFailAction,
      },
    },
    handler: patchNodeRequestHandler(dbClient),
  });
};
