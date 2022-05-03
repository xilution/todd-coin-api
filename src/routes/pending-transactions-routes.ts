import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  DELETE_PENDING_TRANSACTION_PARAMETERS_SCHEMA,
  GET_PENDING_TRANSACTION_PARAMETERS_SCHEMA,
  GET_PENDING_TRANSACTIONS_QUERY_SCHEMA,
  PATCH_PENDING_TRANSACTION_REQUEST_SCHEMA,
  POST_PENDING_TRANSACTION_REQUEST_SCHEMA,
} from "./request-schemas";
import {
  deletePendingTransactionRequestHandler,
  deletePendingTransactionValidationFailAction,
  getPendingTransactionRequestHandler,
  getPendingTransactionsRequestHandler,
  getPendingTransactionsValidationFailAction,
  getPendingTransactionValidationFailAction,
  patchPendingTransactionRequestHandler,
  patchPendingTransactionValidationFailAction,
  postPendingTransactionRequestHandler,
  postPendingTransactionValidationFailAction,
} from "../handlers/pending-transactions-handlers";
import { ApiSettings } from "../types";
import {
  GET_PENDING_TRANSACTION_RESPONSE_SCHEMA,
  GET_PENDING_TRANSACTIONS_RESPONSE_SCHEMA,
  POST_PENDING_TRANSACTION_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  DELETE_PENDING_TRANSACTION_DESCRIPTION,
  GET_PENDING_TRANSACTION_DESCRIPTION,
  GET_PENDING_TRANSACTIONS_DESCRIPTION,
  PATCH_PENDING_TRANSACTION_DESCRIPTION,
  POST_PENDING_TRANSACTION_DESCRIPTION,
} from "./messages";

export const addPendingTransactionsRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/pending-transactions",
    options: {
      description: GET_PENDING_TRANSACTIONS_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        query: GET_PENDING_TRANSACTIONS_QUERY_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getPendingTransactionsValidationFailAction,
      },
      response: {
        schema: GET_PENDING_TRANSACTIONS_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getPendingTransactionsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/pending-transactions/{pendingTransactionId}",
    options: {
      description: GET_PENDING_TRANSACTION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PENDING_TRANSACTION_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getPendingTransactionValidationFailAction,
      },
      response: {
        schema: GET_PENDING_TRANSACTION_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getPendingTransactionRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/pending-transactions",
    options: {
      description: POST_PENDING_TRANSACTION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        payload: POST_PENDING_TRANSACTION_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postPendingTransactionValidationFailAction,
      },
      response: {
        schema: POST_PENDING_TRANSACTION_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: postPendingTransactionRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/pending-transactions/{pendingTransactionId}",
    options: {
      description: PATCH_PENDING_TRANSACTION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PENDING_TRANSACTION_PARAMETERS_SCHEMA,
        payload: PATCH_PENDING_TRANSACTION_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchPendingTransactionValidationFailAction,
      },
    },
    handler: patchPendingTransactionRequestHandler(dbClient),
  });

  server.route({
    method: "DELETE",
    path: "/pending-transactions/{pendingTransactionId}",
    options: {
      description: DELETE_PENDING_TRANSACTION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: DELETE_PENDING_TRANSACTION_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: deletePendingTransactionValidationFailAction,
      },
    },
    handler: deletePendingTransactionRequestHandler(dbClient),
  });
};
