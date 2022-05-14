import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  DELETE_PARTICIPANT_ORGANIZATION_PARAMETERS_SCHEMA,
  GET_PARTICIPANT_PARAMETERS_SCHEMA,
  GET_PARTICIPANTS_QUERY_SCHEMA,
  PATCH_PARTICIPANT_REQUEST_SCHEMA,
  POST_PARTICIPANT_REQUEST_SCHEMA,
  POST_PARTICIPANTS_ORGANIZATION_REQUEST_SCHEMA,
} from "./request-schemas";
import {
  deleteParticipantOrganizationRequestHandler,
  deleteParticipantOrganizationValidationFailAction,
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
  ERROR_RESPONSE_SCHEMA,
  GET_ORGANIZATIONS_RESPONSE_SCHEMA,
  GET_PARTICIPANT_RESPONSE_SCHEMA,
  GET_PARTICIPANTS_RESPONSE_SCHEMA,
  POST_PARTICIPANT_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  GET_PARTICIPANT_DESCRIPTION,
  GET_PARTICIPANTS_DESCRIPTION,
  GET_PARTICIPANT_ORGANIZATIONS_DESCRIPTIONS,
  PATCH_PARTICIPANT_DESCRIPTION,
  POST_PARTICIPANT_DESCRIPTION,
  POST_PARTICIPANTS_ORGANIZATION_DESCRIPTIONS,
  DELETE_PARTICIPANT_ORGANIZATION_DESCRIPTIONS,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_PARTICIPANTS_RESPONSE_SCHEMA,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_PARTICIPANT_RESPONSE_SCHEMA,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            201: {
              description: "Successful",
              schema: POST_PARTICIPANT_RESPONSE_SCHEMA,
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
    handler: patchParticipantRequestHandler(dbClient),
  });

  server.route({
    method: "GET",
    path: "/participants/{participantId}/organizations",
    options: {
      description: GET_PARTICIPANT_ORGANIZATIONS_DESCRIPTIONS,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_ORGANIZATIONS_RESPONSE_SCHEMA,
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
    handler: getParticipantOrganizationRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/participants/{participantId}/relationships/organizations",
    options: {
      description: GET_PARTICIPANT_ORGANIZATIONS_DESCRIPTIONS,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            200: {
              description: "Successful",
              schema: GET_ORGANIZATIONS_RESPONSE_SCHEMA,
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
    handler: postParticipantOrganizationsRequestHandler(dbClient),
  });

  server.route({
    method: "DELETE",
    path: "/participants/{participantId}/relationships/organizations/{organizationId}",
    options: {
      description: DELETE_PARTICIPANT_ORGANIZATION_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: DELETE_PARTICIPANT_ORGANIZATION_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: deleteParticipantOrganizationValidationFailAction,
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
    handler: deleteParticipantOrganizationRequestHandler(dbClient),
  });
};
