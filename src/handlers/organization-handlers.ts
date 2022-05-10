import {
  DbClient,
  OrganizationParticipantRef,
  organizationParticipantRefsBroker,
  organizationsBroker,
  participantsBroker,
} from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import { Organization, Participant } from "@xilution/todd-coin-types";
import {
  buildBadRequestError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import {
  serializeOrganization,
  serializeOrganizations,
} from "../serializers/organization-serializers";
import { serializeParticipants } from "../serializers/participants-serializers";
import { return500 } from "./response-utils";

export const getOrganizationsValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) =>
        buildInvalidQueryError(errorItem)
      ),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const getOrganizationsRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let response: { count: number; rows: Organization[] } | undefined;
    try {
      response = await organizationsBroker.getOrganizations(
        dbClient,
        pageNumber,
        pageSize
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const { count, rows } = response;

    return h
      .response(
        serializeOrganizations(apiSettings, count, pageNumber, pageSize, rows)
      )
      .code(200);
  };

export const getOrganizationValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) =>
        buildInvalidParameterError(errorItem)
      ),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const getOrganizationRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { organizationId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A organization with id: ${organizationId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return h
      .response(serializeOrganization(apiSettings, organization))
      .code(200);
  };

export const getOrganizationParticipantRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { organizationId } = request.params;

    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let getOrganizationParticipantRefsResponse: {
      count: number;
      rows: OrganizationParticipantRef[];
    };
    try {
      getOrganizationParticipantRefsResponse =
        await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
          dbClient,
          0,
          DEFAULT_PAGE_SIZE,
          {
            organizationId,
          }
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const participantIds = getOrganizationParticipantRefsResponse.rows.map(
      (organizationParticipantRef: OrganizationParticipantRef) =>
        organizationParticipantRef.participantId
    );

    let getParticipantsResponse: { count: number; rows: Participant[] };
    try {
      getParticipantsResponse = await participantsBroker.getParticipants(
        dbClient,
        pageNumber,
        pageSize,
        { ids: participantIds }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return serializeParticipants(
      apiSettings,
      getParticipantsResponse.count,
      pageNumber,
      pageSize,
      getParticipantsResponse.rows
    );
  };

export const postOrganizationValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) =>
        buildInvalidAttributeError(errorItem)
      ),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const postOrganizationRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Organization> };

    const newOrganization = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as Organization;

    let getOrganizationsResponse: { count: number };
    try {
      getOrganizationsResponse = await organizationsBroker.getOrganizations(
        dbClient,
        FIRST_PAGE,
        DEFAULT_PAGE_SIZE,
        {
          name: newOrganization.name,
        }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (getOrganizationsResponse.count !== 0) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `Another organization is already using the name: ${newOrganization.name}.`
            ),
          ],
        })
        .code(400);
    }

    let createdOrganization: Organization;
    try {
      createdOrganization = (await organizationsBroker.createOrganization(
        dbClient,
        newOrganization
      )) as Organization;
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    // todo - notify known organizations that a new organization was added

    const authParticipant = request.auth.credentials.participant as Participant;
    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "create-organization",
        result: "success",
        details: {
          is: createdOrganization,
        },
      })
    );

    return h
      .response(serializeOrganization(apiSettings, createdOrganization))
      .header(
        "location",
        `${apiSettings.apiBaseUrl}/organizations/${createdOrganization?.id}`
      )
      .code(201);
  };

export const postOrganizationParticipantsRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Participant>[] };
    const { organizationId } = request.params;

    const participantIds = payload.data.map(
      (apiData: ApiData<Participant>) => apiData.id
    );

    const authParticipant = request.auth.credentials.participant as Participant;

    try {
      await Promise.all(
        participantIds.map((participantId: string) => {
          const newOrganizationParticipantRef: OrganizationParticipantRef = {
            participantId,
            organizationId,
            isAdministrator: false,
            isAuthorizedSigner: false,
          };

          console.log(
            JSON.stringify({
              date: new Date().toISOString(),
              authParticipantEmail: authParticipant.email,
              authParticipantId: authParticipant.id,
              action: "post-organization-participant-reference",
              result: "success",
              details: {
                is: newOrganizationParticipantRef,
              },
            })
          );

          return organizationParticipantRefsBroker.createOrganizationParticipantRef(
            dbClient,
            newOrganizationParticipantRef
          );
        })
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return h.response().code(204);
  };

export const patchOrganizationValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) => {
        if (errorItem.context?.key === "organizationId") {
          return buildInvalidParameterError(errorItem);
        }
        return buildInvalidQueryError(errorItem);
      }),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const patchOrganizationRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { organizationId } = request.params;
    const payload = request.payload as { data: ApiData<Organization> };

    if (payload.data.id !== organizationId) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `The path organization ID does not match the request body organization ID.`
            ),
          ],
        })
        .code(400);
    }

    let existingOrganization: Organization | undefined;
    try {
      existingOrganization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (existingOrganization === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A organization with id: ${organizationId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const updatedOrganization: Organization = {
      id: organizationId,
      ...payload.data.attributes,
    } as Organization;

    try {
      await organizationsBroker.updateOrganization(
        dbClient,
        updatedOrganization
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const authParticipant = request.auth.credentials.participant as Participant;
    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "update-organization",
        result: "success",
        details: {
          before: existingOrganization,
          after: updatedOrganization,
        },
      })
    );

    return h.response().code(204);
  };
