import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  GET_BLOCK_TRANSACTION_PARAMETERS_SCHEMA,
  GET_BLOCK_TRANSACTIONS_PARAMETERS_SCHEMA,
  GET_BLOCK_TRANSACTIONS_QUERY_SCHEMA,
} from "./request-schemas";
import {
  getBlockTransactionRequestHandler,
  getBlockTransactionsRequestHandler,
  getBlockTransactionsValidationFailAction,
  getBlockTransactionValidationFailAction,
} from "../handlers/block-transactions-handlers";
import { ApiSettings } from "../types";
import {
  ERROR_RESPONSE_SCHEMA,
  GET_BLOCK_TRANSACTION_RESPONSE_SCHEMA,
  GET_BLOCK_TRANSACTIONS_RESPONSE_SCHEMA,
  POST_PARTICIPANT_KEY_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  GET_BLOCK_TRANSACTION_DESCRIPTION,
  GET_BLOCK_TRANSACTIONS_DESCRIPTION,
} from "./messages";

export const addBlockTransactionsRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/blocks/{blockId}/transactions",
    options: {
      description: GET_BLOCK_TRANSACTIONS_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        query: GET_BLOCK_TRANSACTIONS_QUERY_SCHEMA,
        params: GET_BLOCK_TRANSACTIONS_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getBlockTransactionsValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_BLOCK_TRANSACTIONS_RESPONSE_SCHEMA,
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
    handler: getBlockTransactionsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/blocks/{blockId}/transactions/{blockTransactionId}",
    options: {
      description: GET_BLOCK_TRANSACTION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_BLOCK_TRANSACTION_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getBlockTransactionValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_BLOCK_TRANSACTION_RESPONSE_SCHEMA,
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
    handler: getBlockTransactionRequestHandler(dbClient, apiSettings),
  });
};
