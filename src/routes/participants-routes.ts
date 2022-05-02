import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  GET_PARTICIPANT_PARAMETERS_SCHEMA,
  GET_PARTICIPANTS_QUERY_SCHEMA,
  PATCH_PARTICIPANT_REQUEST_SCHEMA,
  POST_PARTICIPANT_REQUEST_SCHEMA,
  POST_PARTICIPANTS_ORGANIZATION_REQUEST_SCHEMA,
} from "./request-schemas";
import {
  getParticipantOrganizationRequestHandler,
  getParticipantRequestHandler,
  getParticipantsRequestHandler,
  getParticipantsValidationFailAction,
  getParticipantValidationFailAction,
  patchParticipantRequestHandler,
  patchParticipantValidationFailAction,
  postParticipantOrganizationsRequestHandler,
  postParticipantRequestHandler,
  postParticipantValidationFailAction,
} from "../handlers/participant-handlers";
import { ApiSettings } from "../types";
import {
  getOrganizationValidationFailAction,
  postOrganizationValidationFailAction,
} from "../handlers/organization-handlers";
import {
  GET_ORGANIZATIONS_RESPONSE_SCHEMA,
  GET_PARTICIPANT_RESPONSE_SCHEMA,
  GET_PARTICIPANTS_RESPONSE_SCHEMA,
  POST_PARTICIPANT_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  GET_PARTICIPANT_DESCRIPTION,
  GET_PARTICIPANTS_DESCRIPTION,
  GET_PARTICIPANTS_ORGANIZATION_DESCRIPTIONS,
  PATCH_PARTICIPANT_DESCRIPTION,
  POST_PARTICIPANT_DESCRIPTION,
  POST_PARTICIPANTS_ORGANIZATION_DESCRIPTIONS,
} from "./messages";

export const addParticipantRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/participants",
    options: {
      description: GET_PARTICIPANTS_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        query: GET_PARTICIPANTS_QUERY_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantsValidationFailAction,
      },
      response: {
        schema: GET_PARTICIPANTS_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getParticipantsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/participants/{participantId}",
    options: {
      description: GET_PARTICIPANT_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getParticipantValidationFailAction,
      },
      response: {
        schema: GET_PARTICIPANT_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getParticipantRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/participants",
    options: {
      description: POST_PARTICIPANT_DESCRIPTION,
      tags: ["api"],
      validate: {
        payload: POST_PARTICIPANT_REQUEST_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postParticipantValidationFailAction,
      },
      response: {
        schema: POST_PARTICIPANT_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: postParticipantRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/participants/{participantId}",
    options: {
      description: PATCH_PARTICIPANT_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        payload: PATCH_PARTICIPANT_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchParticipantValidationFailAction,
      },
    },
    handler: patchParticipantRequestHandler(dbClient),
  });

  server.route({
    method: "GET",
    path: "/participants/{participantId}/organizations",
    options: {
      description: GET_PARTICIPANTS_ORGANIZATION_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
      response: {
        schema: GET_ORGANIZATIONS_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getParticipantOrganizationRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/participants/{participantId}/relationships/organizations",
    options: {
      description: GET_PARTICIPANTS_ORGANIZATION_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
      response: {
        schema: GET_ORGANIZATIONS_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getParticipantOrganizationRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/participants/{participantId}/relationships/organizations",
    options: {
      description: POST_PARTICIPANTS_ORGANIZATION_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        payload: POST_PARTICIPANTS_ORGANIZATION_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postOrganizationValidationFailAction,
      },
    },
    handler: postParticipantOrganizationsRequestHandler(dbClient),
  });
};
