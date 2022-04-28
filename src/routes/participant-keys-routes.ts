import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_PARTICIPANT_KEY_PARAMETERS_SCHEMA,
  GET_PARTICIPANTS_QUERY_SCHEMA,
  PATCH_PARTICIPANT_KEY_SCHEMA,
  POST_PARTICIPANT_KEY_SCHEMA,
} from "./validation-schemas";
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

export const addParticipantKeyRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/participant-keys",
    options: {
      auth: "custom",
      validate: {
        query: GET_PARTICIPANTS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantKeysValidationFailAction,
      },
    },
    handler: getParticipantKeysRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/participant-keys/{participantKeyId}",
    options: {
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_KEY_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantKeyValidationFailAction,
      },
    },
    handler: getParticipantKeyRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/participant-keys",
    options: {
      auth: "custom",
      validate: {
        payload: POST_PARTICIPANT_KEY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postParticipantKeyValidationFailAction,
      },
    },
    handler: postParticipantKeyRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/participantKeys/{participantKeyId}",
    options: {
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_KEY_PARAMETERS_SCHEMA,
        payload: PATCH_PARTICIPANT_KEY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchParticipantKeyValidationFailAction,
      },
    },
    handler: patchParticipantKeyRequestHandler(dbClient),
  });
};
