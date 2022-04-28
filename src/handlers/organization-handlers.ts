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
  buildOrganizationSerializer,
  buildOrganizationsSerializer,
  buildParticipantsSerializer,
} from "./serializer-builders";
import {
  buildInternalServerError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";

export const getOrganizationsValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
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
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    const { count, rows } = response;

    return buildOrganizationsSerializer(
      apiSettings,
      count,
      pageNumber,
      pageSize
    ).serialize(rows);
  };

export const getOrganizationValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
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
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (organization === undefined) {
      return h
        .response({
          errors: [
            buildNofFountError(
              `A organization with id: ${organizationId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return buildOrganizationSerializer(apiSettings).serialize(organization);
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
        await organizationParticipantRefsBroker.getOrganizationParticipantRefByOrganizationId(
          dbClient,
          organizationId
        );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
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
        participantIds
      );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    return buildParticipantsSerializer(
      apiSettings,
      getParticipantsResponse.count,
      pageNumber,
      pageSize
    ).serialize(getParticipantsResponse.rows);
  };

export const postOrganizationValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
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

    // todo - check for dupe organizations

    // todo - once validated, sync up with the new organization

    const newOrganization: Organization = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as Organization;

    let createdOrganization: Organization | undefined;
    try {
      createdOrganization = await organizationsBroker.createOrganization(
        dbClient,
        newOrganization
      );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    // todo - notify known organizations that a new organization was added

    return buildOrganizationSerializer(apiSettings).serialize(
      createdOrganization
    );
  };

export const postOrganizationParticipantsRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Participant>[] };
    const { organizationId } = request.params;

    const participantIds = payload.data.map(
      (apiData: ApiData<Participant>) => apiData.id
    );

    try {
      await Promise.all(
        participantIds.map((participantId: string) => {
          return organizationParticipantRefsBroker.createOrganizationParticipantRef(
            dbClient,
            {
              participantId,
              organizationId,
            }
          );
        })
      );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
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

    // todo - confirm that the user can do this

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
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    return h.response().code(204);
  };
