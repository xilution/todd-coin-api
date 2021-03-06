import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import {
  AUTH_HEADER_SCHEMA,
  DELETE_ORGANIZATION_ADMINISTRATOR_PARAMETERS_SCHEMA,
  DELETE_ORGANIZATION_AUTHORIZED_SIGNER_PARAMETERS_SCHEMA,
  DELETE_ORGANIZATION_PARTICIPANT_PARAMETERS_SCHEMA,
  GET_ORGANIZATION_PARAMETERS_SCHEMA,
  GET_ORGANIZATIONS_QUERY_SCHEMA,
  PATCH_ORGANIZATION_REQUEST_SCHEMA,
  POST_ORGANIZATION_ADMINISTRATORS_REQUEST_SCHEMA,
  POST_ORGANIZATION_AUTHORIZED_SIGNERS_REQUEST_SCHEMA,
  POST_ORGANIZATION_PARTICIPANTS_REQUEST_SCHEMA,
  POST_ORGANIZATION_REQUEST_SCHEMA,
} from "./request-schemas";
import {
  deleteOrganizationAdministratorRequestHandler,
  deleteOrganizationAuthorizedSignerRequestHandler,
  deleteOrganizationParticipantRequestHandler,
  deleteOrganizationParticipantValidationFailAction,
  getOrganizationAdministratorRequestHandler,
  getOrganizationAuthorizedSignerRequestHandler,
  getOrganizationParticipantRequestHandler,
  getOrganizationRequestHandler,
  getOrganizationsRequestHandler,
  getOrganizationsValidationFailAction,
  getOrganizationValidationFailAction,
  patchOrganizationRequestHandler,
  patchOrganizationValidationFailAction,
  postOrganizationAdministratorsRequestHandler,
  postOrganizationAuthorizedSignersRequestHandler,
  postOrganizationParticipantsRequestHandler,
  postOrganizationRequestHandler,
  postOrganizationValidationFailAction,
} from "../handlers/organization-handlers";
import { ApiSettings } from "../types";
import {
  ERROR_RESPONSE_SCHEMA,
  GET_ORGANIZATION_RESPONSE_SCHEMA,
  GET_ORGANIZATIONS_RESPONSE_SCHEMA,
  GET_PARTICIPANTS_RESPONSE_SCHEMA,
  POST_ORGANIZATION_RESPONSE_SCHEMA,
} from "./response-schemas";
import {
  DELETE_ORGANIZATION_ADMINISTRATOR_DESCRIPTIONS,
  DELETE_ORGANIZATION_AUTHORIZED_SIGNER_DESCRIPTIONS,
  DELETE_ORGANIZATION_PARTICIPANT_DESCRIPTIONS,
  GET_ORGANIZATION_ADMINISTRATORS_DESCRIPTIONS,
  GET_ORGANIZATION_AUTHORIZED_SIGNERS_DESCRIPTIONS,
  GET_ORGANIZATION_DESCRIPTION,
  GET_ORGANIZATION_PARTICIPANTS_DESCRIPTIONS,
  GET_ORGANIZATIONS_DESCRIPTION,
  PATCH_ORGANIZATION_DESCRIPTION,
  POST_ORGANIZATION_ADMINISTRATORS_DESCRIPTIONS,
  POST_ORGANIZATION_AUTHORIZED_SIGNERS_DESCRIPTIONS,
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
      validate: {
        query: GET_ORGANIZATIONS_QUERY_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: getOrganizationsValidationFailAction,
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
    handler: getOrganizationsRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}",
    options: {
      description: GET_ORGANIZATION_DESCRIPTION,
      tags: ["api"],
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
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
              schema: GET_ORGANIZATION_RESPONSE_SCHEMA,
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
      plugins: {
        "hapi-swagger": {
          responses: {
            201: {
              description: "Successful",
              schema: POST_ORGANIZATION_RESPONSE_SCHEMA,
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
    handler: patchOrganizationRequestHandler(dbClient),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}/participants",
    options: {
      description: GET_ORGANIZATION_PARTICIPANTS_DESCRIPTIONS,
      tags: ["api"],
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
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
    handler: getOrganizationParticipantRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}/relationships/participants",
    options: {
      description: GET_ORGANIZATION_PARTICIPANTS_DESCRIPTIONS,
      tags: ["api"],
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
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
    handler: postOrganizationParticipantsRequestHandler(dbClient),
  });

  server.route({
    method: "DELETE",
    path: "/organizations/{organizationId}/relationships/participants/{participantId}",
    options: {
      description: DELETE_ORGANIZATION_PARTICIPANT_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: DELETE_ORGANIZATION_PARTICIPANT_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: deleteOrganizationParticipantValidationFailAction,
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
    handler: deleteOrganizationParticipantRequestHandler(dbClient),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}/authorized-signers",
    options: {
      description: GET_ORGANIZATION_AUTHORIZED_SIGNERS_DESCRIPTIONS,
      tags: ["api"],
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
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
    handler: getOrganizationAuthorizedSignerRequestHandler(
      dbClient,
      apiSettings
    ),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}/relationships/authorized-signers",
    options: {
      description: GET_ORGANIZATION_AUTHORIZED_SIGNERS_DESCRIPTIONS,
      tags: ["api"],
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
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
    handler: getOrganizationAuthorizedSignerRequestHandler(
      dbClient,
      apiSettings
    ),
  });

  server.route({
    method: "POST",
    path: "/organizations/{organizationId}/relationships/authorized-signers",
    options: {
      description: POST_ORGANIZATION_AUTHORIZED_SIGNERS_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        payload: POST_ORGANIZATION_AUTHORIZED_SIGNERS_REQUEST_SCHEMA,
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
    handler: postOrganizationAuthorizedSignersRequestHandler(dbClient),
  });

  server.route({
    method: "DELETE",
    path: "/organizations/{organizationId}/relationships/authorized-signers/{authorizedSignerId}",
    options: {
      description: DELETE_ORGANIZATION_AUTHORIZED_SIGNER_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: DELETE_ORGANIZATION_AUTHORIZED_SIGNER_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: deleteOrganizationParticipantValidationFailAction,
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
    handler: deleteOrganizationAuthorizedSignerRequestHandler(dbClient),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}/administrators",
    options: {
      description: GET_ORGANIZATION_ADMINISTRATORS_DESCRIPTIONS,
      tags: ["api"],
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
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
    handler: getOrganizationAdministratorRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "GET",
    path: "/organizations/{organizationId}/relationships/administrators",
    options: {
      description: GET_ORGANIZATION_ADMINISTRATORS_DESCRIPTIONS,
      tags: ["api"],
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
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
    handler: getOrganizationAdministratorRequestHandler(dbClient, apiSettings),
  });

  server.route({
    method: "POST",
    path: "/organizations/{organizationId}/relationships/administrators",
    options: {
      description: POST_ORGANIZATION_ADMINISTRATORS_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: GET_ORGANIZATION_PARAMETERS_SCHEMA,
        payload: POST_ORGANIZATION_ADMINISTRATORS_REQUEST_SCHEMA,
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
    handler: postOrganizationAdministratorsRequestHandler(dbClient),
  });

  server.route({
    method: "DELETE",
    path: "/organizations/{organizationId}/relationships/administrators/{administratorId}",
    options: {
      description: DELETE_ORGANIZATION_ADMINISTRATOR_DESCRIPTIONS,
      tags: ["api"],
      auth: "custom",
      validate: {
        params: DELETE_ORGANIZATION_ADMINISTRATOR_PARAMETERS_SCHEMA,
        headers: AUTH_HEADER_SCHEMA,
        options: {
          abortEarly: false,
        },
        failAction: deleteOrganizationParticipantValidationFailAction,
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
    handler: deleteOrganizationAdministratorRequestHandler(dbClient),
  });
};
