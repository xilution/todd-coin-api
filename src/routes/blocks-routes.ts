import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  GET_BLOCK_PARAMETERS_SCHEMA,
  GET_BLOCKS_QUERY_SCHEMA,
  POST_BLOCK_REQUEST_SCHEMA,
} from "./request-schemas";
import {
  getBlockRequestHandler,
  getBlocksRequestHandler,
  getBlocksValidationFailAction,
  getBlockValidationFailAction,
  postBlockRequestHandler,
  postBlockValidationFailAction,
} from "../handlers/blocks-handlers";
import { ApiSettings } from "../types";
import {
  ERROR_RESPONSE_SCHEMA,
  GET_BLOCK_RESPONSE_SCHEMA,
  GET_BLOCKS_RESPONSE_SCHEMA,
  POST_BLOCK_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  GET_BLOCK_DESCRIPTION,
  GET_BLOCKS_DESCRIPTION,
  POST_BLOCK_DESCRIPTION,
} from "./messages";

export const addBlocksRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/blocks",
    options: {
      description: GET_BLOCKS_DESCRIPTION,
      tags: ["api"],
      validate: {
        query: GET_BLOCKS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getBlocksValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_BLOCKS_RESPONSE_SCHEMA,
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
    handler: getBlocksRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/blocks/{blockId}",
    options: {
      description: GET_BLOCK_DESCRIPTION,
      tags: ["api"],
      validate: {
        params: GET_BLOCK_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getBlockValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_BLOCK_RESPONSE_SCHEMA,
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
    handler: getBlockRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/blocks",
    options: {
      description: POST_BLOCK_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        payload: POST_BLOCK_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postBlockValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            201: {
              description: "Successful",
              schema: POST_BLOCK_RESPONSE_SCHEMA,
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
    handler: postBlockRequestHandler(dbClient, apiSettings),
  });
};
