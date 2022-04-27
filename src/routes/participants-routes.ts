import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_ORGANIZATION_PARAMETERS_SCHEMA,
  GET_PARTICIPANT_PARAMETERS_SCHEMA,
  GET_PARTICIPANTS_QUERY_SCHEMA,
  POST_ORGANIZATION_PARTICIPANTS_SCHEMA,
  POST_PARTICIPANT_SCHEMA,
  POST_PARTICIPANTS_ORGANIZATION_SCHEMA,
} from "./validation-schemas";
import {
  getParticipantOrganizationRequestHandler,
  getParticipantRequestHandler,
  getParticipantsRequestHandler,
  getParticipantsValidationFailAction,
  getParticipantValidationFailAction,
  postParticipantOrganizationsRequestHandler,
  postParticipantRequestHandler,
  postParticipantValidationFailAction,
} from "../handlers/participant-handlers";
import { ApiSettings } from "../types";
import {
  getOrganizationParticipantRequestHandler,
  getOrganizationValidationFailAction,
  postOrganizationParticipantsRequestHandler,
  postOrganizationValidationFailAction,
} from "../handlers/organization-handlers";

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

  server.route({
    method: "GET",
    path: "/participants/{participantId}/organizations",
    options: {
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
    },
    handler: getParticipantOrganizationRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/participants/{participantId}/relationships/organizations",
    options: {
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
    },
    handler: getParticipantOrganizationRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/participants/{participantId}/relationships/organizations",
    options: {
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        payload: POST_PARTICIPANTS_ORGANIZATION_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postOrganizationValidationFailAction,
      },
    },
    handler: postParticipantOrganizationsRequestHandler(dbClient, apiSettings),
  });
};
