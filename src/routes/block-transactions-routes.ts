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
  GET_BLOCK_TRANSACTION_RESPONSE_SCHEMA,
  GET_BLOCK_TRANSACTIONS_RESPONSE_SCHEMA,
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
      response: {
        schema: GET_BLOCK_TRANSACTIONS_RESPONSE_SCHEMA,
        failAction: "log",
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
      response: {
        schema: GET_BLOCK_TRANSACTION_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getBlockTransactionRequestHandler(dbClient, apiSettings),
  });
};
