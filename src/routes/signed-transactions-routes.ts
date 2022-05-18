import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  GET_SIGNED_TRANSACTION_PARAMETERS_SCHEMA,
  GET_SIGNED_TRANSACTIONS_QUERY_SCHEMA,
  PATCH_SIGNED_TRANSACTION_REQUEST_SCHEMA,
  POST_SIGNED_TRANSACTION_REQUEST_SCHEMA,
} from "./request-schemas";
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
import {
  ERROR_RESPONSE_SCHEMA,
  GET_SIGNED_TRANSACTION_RESPONSE_SCHEMA,
  GET_SIGNED_TRANSACTIONS_RESPONSE_SCHEMA,
  POST_SIGNED_TRANSACTION_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  GET_SIGNED_TRANSACTION_DESCRIPTION,
  GET_SIGNED_TRANSACTIONS_DESCRIPTION,
  PATCH_SIGNED_TRANSACTION_DESCRIPTION,
  POST_SIGNED_TRANSACTION_DESCRIPTION,
} from "./messages";

export const addSignedTransactionsRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/signed-transactions",
    options: {
      description: GET_SIGNED_TRANSACTIONS_DESCRIPTION,
      tags: ["api"],
      validate: {
        query: GET_SIGNED_TRANSACTIONS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getSignedTransactionsValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_SIGNED_TRANSACTIONS_RESPONSE_SCHEMA,
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
    handler: getSignedTransactionsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/signed-transactions/{signedTransactionId}",
    options: {
      description: GET_SIGNED_TRANSACTION_DESCRIPTION,
      tags: ["api"],
      validate: {
        params: GET_SIGNED_TRANSACTION_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getSignedTransactionValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_SIGNED_TRANSACTION_RESPONSE_SCHEMA,
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
    handler: getSignedTransactionRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/signed-transactions",
    options: {
      description: POST_SIGNED_TRANSACTION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        payload: POST_SIGNED_TRANSACTION_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postSignedTransactionValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            201: {
              description: "Successful",
              schema: POST_SIGNED_TRANSACTION_RESPONSE_SCHEMA,
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
    handler: postSignedTransactionRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/signed-transactions/{signedTransactionId}",
    options: {
      description: PATCH_SIGNED_TRANSACTION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_SIGNED_TRANSACTION_PARAMETERS_SCHEMA,
        payload: PATCH_SIGNED_TRANSACTION_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchSignedTransactionValidationFailAction,
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
    handler: patchSignedTransactionRequestHandler(dbClient),
  });
};
