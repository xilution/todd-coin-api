import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_PENDING_TRANSACTION_PARAMETERS_SCHEMA,
  GET_PENDING_TRANSACTIONS_QUERY_SCHEMA,
  PATCH_PENDING_TRANSACTION_SCHEMA,
  POST_PENDING_TRANSACTION_SCHEMA,
} from "./validation-schemas";
import {
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

export const addPendingTransactionsRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/pending-transactions",
    options: {
      auth: "custom",
      validate: {
        query: GET_PENDING_TRANSACTIONS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getPendingTransactionsValidationFailAction,
      },
    },
    handler: getPendingTransactionsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/pending-transactions/{pendingTransactionId}",
    options: {
      auth: "custom",
      validate: {
        params: GET_PENDING_TRANSACTION_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getPendingTransactionValidationFailAction,
      },
    },
    handler: getPendingTransactionRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/pending-transactions",
    options: {
      auth: "custom",
      validate: {
        payload: POST_PENDING_TRANSACTION_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postPendingTransactionValidationFailAction,
      },
    },
    handler: postPendingTransactionRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/pendingTransactions/{pendingTransactionId}",
    options: {
      auth: "custom",
      validate: {
        params: GET_PENDING_TRANSACTION_PARAMETERS_SCHEMA,
        payload: PATCH_PENDING_TRANSACTION_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchPendingTransactionValidationFailAction,
      },
    },
    handler: patchPendingTransactionRequestHandler(dbClient),
  });
};
