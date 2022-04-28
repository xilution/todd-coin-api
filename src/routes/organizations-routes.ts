import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_ORGANIZATION_PARAMETERS_SCHEMA,
  GET_ORGANIZATIONS_QUERY_SCHEMA,
  PATCH_ORGANIZATION_SCHEMA,
  POST_ORGANIZATION_PARTICIPANTS_SCHEMA,
  POST_ORGANIZATION_SCHEMA,
} from "./validation-schemas";
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

export const addOrganizationsRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  server.route({
    method: "GET",
    path: "/organizations",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        query: GET_ORGANIZATIONS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationsValidationFailAction,
      },
    },
    handler: getOrganizationsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
    },
    handler: getOrganizationRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/organizations",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        payload: POST_ORGANIZATION_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postOrganizationValidationFailAction,
      },
    },
    handler: postOrganizationRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "PATCH",
    path: "/organizations/{organizationId}",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        payload: PATCH_ORGANIZATION_SCHEMA,
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
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
    },
    handler: getOrganizationParticipantRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}/relationships/participants",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationValidationFailAction,
      },
    },
    handler: getOrganizationParticipantRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/organizations/{organizationId}/relationships/participants",
    options: {
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        payload: POST_ORGANIZATION_PARTICIPANTS_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: postOrganizationValidationFailAction,
      },
    },
    handler: postOrganizationParticipantsRequestHandler(dbClient),
  });
};