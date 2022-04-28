import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_BLOCK_PARAMETERS_SCHEMA,
  GET_BLOCKS_QUERY_SCHEMA,
  POST_BLOCK_SCHEMA,
} from "./validation-schemas";
import {
  getBlockRequestHandler,
  getBlocksRequestHandler,
  getBlocksValidationFailAction,
  getBlockValidationFailAction,
  postBlockRequestHandler,
  postBlockValidationFailAction,
} from "../handlers/blocks-handlers";
import { ApiSettings } from "../types";

export const addBlocksRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/blocks",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        query: GET_BLOCKS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getBlocksValidationFailAction,
      },
    },
    handler: getBlocksRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/blocks/{blockId}",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_BLOCK_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getBlockValidationFailAction,
      },
    },
    handler: getBlockRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/blocks",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        payload: POST_BLOCK_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postBlockValidationFailAction,
      },
    },
    handler: postBlockRequestHandler(dbClient, apiSettings),
  });
};
