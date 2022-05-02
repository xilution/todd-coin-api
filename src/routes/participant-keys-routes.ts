import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  GET_PARTICIPANT_KEY_PARAMETERS_SCHEMA,
  GET_PARTICIPANTS_QUERY_SCHEMA,
  PATCH_PARTICIPANT_KEY_REQUEST_SCHEMA,
  POST_PARTICIPANT_KEY_REQUEST_SCHEMA,
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
    path: "/participant-keys",
    options: {
      description: GET_PARTICIPANT_KEYS_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        query: GET_PARTICIPANTS_QUERY_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantKeysValidationFailAction,
      },
      response: {
        schema: GET_PARTICIPANT_KEYS_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getParticipantKeysRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/participant-keys/{participantKeyId}",
    options: {
      description: GET_PARTICIPANT_KEY_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_KEY_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantKeyValidationFailAction,
      },
      response: {
        schema: GET_PARTICIPANT_KEY_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getParticipantKeyRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/participant-keys",
    options: {
      description: POST_PARTICIPANT_KEY_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
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
            200: {
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
    path: "/participant-keys/{participantKeyId}",
    options: {
      description: PATCH_PARTICIPANT_KEY_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_KEY_PARAMETERS_SCHEMA,
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
