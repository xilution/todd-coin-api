import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_SIGNED_TRANSACTION_PARAMETERS_SCHEMA,
  GET_SIGNED_TRANSACTIONS_QUERY_SCHEMA,
  PATCH_SIGNED_TRANSACTION_SCHEMA,
  POST_SIGNED_TRANSACTION_SCHEMA,
} from "./validation-schemas";
import {
  getSignedTransactionRequestHandler,
  getSignedTransactionsRequestHandler,
  getSignedTransactionsValidationFailAction,
  getSignedTransactionValidationFailAction,
  patchSignedTransactionRequestHandler,
  patchSignedTransactionValidationFailAction,
  postSignedTransactionRequestHandler,
  postSignedTransactionValidationFailAction,
} from "../handlers/signed-transactions-handlers";
import { ApiSettings } from "../types";

export const addSignedTransactionsRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/signed-transactions",
    options: {
      auth: "custom",
      validate: {
        query: GET_SIGNED_TRANSACTIONS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getSignedTransactionsValidationFailAction,
      },
    },
    handler: getSignedTransactionsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/signed-transactions/{signedTransactionId}",
    options: {
      auth: "custom",
      validate: {
        params: GET_SIGNED_TRANSACTION_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getSignedTransactionValidationFailAction,
      },
    },
    handler: getSignedTransactionRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/signed-transactions",
    options: {
      auth: "custom",
      validate: {
        payload: POST_SIGNED_TRANSACTION_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postSignedTransactionValidationFailAction,
      },
    },
    handler: postSignedTransactionRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/signedTransactions/{signedTransactionId}",
    options: {
      auth: "custom",
      validate: {
        params: GET_SIGNED_TRANSACTION_PARAMETERS_SCHEMA,
        payload: PATCH_SIGNED_TRANSACTION_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchSignedTransactionValidationFailAction,
      },
    },
    handler: patchSignedTransactionRequestHandler(dbClient),
  });
};
