import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_PARTICIPANT_PARAMETERS_SCHEMA,
  GET_PARTICIPANTS_QUERY_SCHEMA,
  POST_PARTICIPANT_SCHEMA,
} from "./validation-schemas";
import {
  getParticipantRequestHandler,
  getParticipantsRequestHandler,
  getParticipantsValidationFailAction,
  getParticipantValidationFailAction,
  postParticipantRequestHandler,
  postParticipantValidationFailAction,
} from "../handlers/participant-handlers";
import { ApiSettings } from "../types";

export const addParticipantRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/participants",
    options: {
      auth: "custom",
      validate: {
        query: GET_PARTICIPANTS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantsValidationFailAction,
      },
    },
    handler: getParticipantsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/participants/{participantId}",
    options: {
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantValidationFailAction,
      },
    },
    handler: getParticipantRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/participants",
    options: {
      auth: "custom",
      validate: {
        payload: POST_PARTICIPANT_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postParticipantValidationFailAction,
      },
    },
    handler: postParticipantRequestHandler(dbClient, apiSettings),
  });
};
