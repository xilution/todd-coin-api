import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_PARTICIPANT_PARAMETERS_SCHEMA,
  GET_PARTICIPANTS_QUERY_SCHEMA,
  PATCH_PARTICIPANT_SCHEMA,
  POST_PARTICIPANT_SCHEMA,
  POST_PARTICIPANTS_ORGANIZATION_SCHEMA,
} from "./validation-schemas";
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

export const addParticipantRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/participants",
    options: {
      tags: ["api"],
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
      tags: ["api"],
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
      tags: ["api"],
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
    method: "PATCH",
    path: "/participants/{participantId}",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_PARTICIPANT_PARAMETERS_SCHEMA,
        payload: PATCH_PARTICIPANT_SCHEMA,
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
      tags: ["api"],
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
      tags: ["api"],
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
      tags: ["api"],
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
    handler: postParticipantOrganizationsRequestHandler(dbClient),
  });
};
