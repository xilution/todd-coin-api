import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  GET_ORGANIZATION_PARAMETERS_SCHEMA,
  GET_ORGANIZATIONS_QUERY_SCHEMA,
  POST_ORGANIZATION_PARTICIPANTS_SCHEMA,
  POST_ORGANIZATION_SCHEMA,
} from "./validation-schemas";
import {
  getOrganizationParticipantRequestHandler,
  getOrganizationRequestHandler,
  getOrganizationsRequestHandler,
  getOrganizationsValidationFailAction,
  getOrganizationValidationFailAction,
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
    method: "GET",
    path: "/organizations/{organizationId}/participants",
    options: {
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
    handler: postOrganizationParticipantsRequestHandler(dbClient, apiSettings),
  });
};
