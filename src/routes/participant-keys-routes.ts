import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  GET_PARTICIPANT_KEY_PARAMETERS_SCHEMA,
  GET_PARTICIPANT_KEYS_PARAMETERS_SCHEMA,
  GET_PARTICIPANTS_QUERY_SCHEMA,
  PATCH_PARTICIPANT_KEY_REQUEST_SCHEMA,
  PATCH_PARTICIPANT_KEYS_PARAMETERS_SCHEMA,
  POST_PARTICIPANT_KEY_REQUEST_SCHEMA,
  POST_PARTICIPANT_KEYS_PARAMETERS_SCHEMA,
} from "./request-schemas";
import {
  getParticipantKeyRequestHandler,
  getParticipantKeysRequestHandler,
  getParticipantKeysValidationFailAction,
  getParticipantKeyValidationFailAction,
  patchParticipantKeyRequestHandler,
  patchParticipantKeyValidationFailAction,
  postParticipantKeyRequestHandler,
  postParticipantKeyValidationFailAction,
} from "../handlers/participant-key-handlers";
import { ApiSettings } from "../types";
import {
  ERROR_RESPONSE_SCHEMA,
  GET_PARTICIPANT_KEY_RESPONSE_SCHEMA,
  GET_PARTICIPANT_KEYS_RESPONSE_SCHEMA,
  POST_PARTICIPANT_KEY_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  GET_PARTICIPANT_KEY_DESCRIPTION,
  GET_PARTICIPANT_KEYS_DESCRIPTION,
  PATCH_PARTICIPANT_KEY_DESCRIPTION,
  POST_PARTICIPANT_KEY_DESCRIPTION,
} from "./messages";

export const addParticipantKeyRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/participants/{participantId}/keys",
    options: {
      description: GET_PARTICIPANT_KEYS_DESCRIPTION,
      tags: ["api"],
      validate: {
        params: GET_PARTICIPANT_KEYS_PARAMETERS_SCHEMA,
        query: GET_PARTICIPANTS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantKeysValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_PARTICIPANT_KEYS_RESPONSE_SCHEMA,
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
    handler: getParticipantKeysRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/participants/{participantId}/keys/{participantKeyId}",
    options: {
      description: GET_PARTICIPANT_KEY_DESCRIPTION,
      tags: ["api"],
      validate: {
        params: GET_PARTICIPANT_KEY_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantKeyValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_PARTICIPANT_KEY_RESPONSE_SCHEMA,
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
    handler: getParticipantKeyRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/participants/{participantId}/keys",
    options: {
      description: POST_PARTICIPANT_KEY_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: POST_PARTICIPANT_KEYS_PARAMETERS_SCHEMA,
        payload: POST_PARTICIPANT_KEY_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postParticipantKeyValidationFailAction,
      },
      plugins: {
        "hapi-swagger": {
          responses: {
            201: {
              description: "Successful",
              schema: POST_PARTICIPANT_KEY_RESPONSE_SCHEMA,
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
    handler: postParticipantKeyRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/participants/{participantId}/keys/{participantKeyId}",
    options: {
      description: PATCH_PARTICIPANT_KEY_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: PATCH_PARTICIPANT_KEYS_PARAMETERS_SCHEMA,
        payload: PATCH_PARTICIPANT_KEY_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchParticipantKeyValidationFailAction,
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
    handler: patchParticipantKeyRequestHandler(dbClient),
  });
};
