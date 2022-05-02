import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  GET_ORGANIZATION_PARAMETERS_SCHEMA,
  GET_ORGANIZATIONS_QUERY_SCHEMA,
  PATCH_ORGANIZATION_REQUEST_SCHEMA,
  POST_ORGANIZATION_PARTICIPANTS_REQUEST_SCHEMA,
  POST_ORGANIZATION_REQUEST_SCHEMA,
} from "./request-schemas";
import {
  getOrganizationParticipantRequestHandler,
  getOrganizationRequestHandler,
  getOrganizationsRequestHandler,
  getOrganizationsValidationFailAction,
  getOrganizationValidationFailAction,
  patchOrganizationRequestHandler,
  patchOrganizationValidationFailAction,
  postOrganizationParticipantsRequestHandler,
  postOrganizationRequestHandler,
  postOrganizationValidationFailAction,
} from "../handlers/organization-handlers";
import { ApiSettings } from "../types";
import {
  GET_ORGANIZATION_RESPONSE_SCHEMA,
  GET_ORGANIZATIONS_RESPONSE_SCHEMA,
  GET_PARTICIPANTS_RESPONSE_SCHEMA,
  POST_ORGANIZATION_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  GET_ORGANIZATION_DESCRIPTION,
  GET_ORGANIZATION_PARTICIPANTS_DESCRIPTIONS,
  GET_ORGANIZATIONS_DESCRIPTION,
  PATCH_ORGANIZATION_DESCRIPTION,
  POST_ORGANIZATION_DESCRIPTION,
  POST_ORGANIZATION_PARTICIPANTS_DESCRIPTIONS,
} from "./messages";

export const addOrganizationsRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/organizations",
    options: {
      description: GET_ORGANIZATIONS_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        query: GET_ORGANIZATIONS_QUERY_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationsValidationFailAction,
      },
      response: {
        schema: GET_ORGANIZATIONS_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getOrganizationsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}",
    options: {
      description: GET_ORGANIZATION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
      response: {
        schema: GET_ORGANIZATION_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getOrganizationRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/organizations",
    options: {
      description: POST_ORGANIZATION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        payload: POST_ORGANIZATION_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postOrganizationValidationFailAction,
      },
      response: {
        schema: POST_ORGANIZATION_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: postOrganizationRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/organizations/{organizationId}",
    options: {
      description: PATCH_ORGANIZATION_DESCRIPTION,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        payload: PATCH_ORGANIZATION_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: patchOrganizationValidationFailAction,
      },
    },
    handler: patchOrganizationRequestHandler(dbClient),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}/participants",
    options: {
      description: GET_ORGANIZATION_PARTICIPANTS_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
      response: {
        schema: GET_PARTICIPANTS_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getOrganizationParticipantRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}/relationships/participants",
    options: {
      description: GET_ORGANIZATION_PARTICIPANTS_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
      response: {
        schema: GET_PARTICIPANTS_RESPONSE_SCHEMA,
        failAction: "log",
      },
    },
    handler: getOrganizationParticipantRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/organizations/{organizationId}/relationships/participants",
    options: {
      description: POST_ORGANIZATION_PARTICIPANTS_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        payload: POST_ORGANIZATION_PARTICIPANTS_REQUEST_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postOrganizationValidationFailAction,
      },
    },
    handler: postOrganizationParticipantsRequestHandler(dbClient),
  });
};
