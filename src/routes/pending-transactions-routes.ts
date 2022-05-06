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
  ERROR_RESPONSE_SCHEMA,
  GET_PENDING_TRANSACTION_RESPONSE_SCHEMA,
  GET_PENDING_TRANSACTIONS_RESPONSE_SCHEMA,
  POST_PARTICIPANT_KEY_RESPONSE_SCHEMA,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_PENDING_TRANSACTIONS_RESPONSE_SCHEMA,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_PENDING_TRANSACTION_RESPONSE_SCHEMA,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            201: {
              description: "Successful",
              schema: POST_PENDING_TRANSACTION_RESPONSE_SCHEMA,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            204: {
              description: "No Response",
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
      plugins: {
        "hapi-swagger": {
          responses: {
            204: {
              description: "No Response",
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
    handler: deletePendingTransactionRequestHandler(dbClient),
  });
};
