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
import { hashUtils } from "@xilution/todd-coin-utils";
import {
  buildBadRequestError,
  buildForbiddenError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import {
  serializeParticipant,
  serializeParticipants,
} from "../serializers/participants-serializers";
import { serializeOrganizations } from "../serializers/organization-serializers";
import { return404, return500 } from "./response-utils";

export const getParticipantsValidationFailAction = (
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

export const getParticipantValidationFailAction = (
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

export const deleteParticipantOrganizationValidationFailAction = (
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

export const postParticipantValidationFailAction = (
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

export const patchParticipantValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) => {
        if (errorItem.context?.key === "participantId") {
          return buildInvalidParameterError(errorItem);
        }
        return buildInvalidQueryError(errorItem);
      }),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const getParticipantsRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let response: { count: number; rows: Participant[] };
    try {
      response = await participantsBroker.getParticipants(
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
        serializeParticipants(apiSettings, count, pageNumber, pageSize, rows)
      )
      .code(200);
  };

export const getParticipantRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { participantId } = request.params;

    let participant: Participant | undefined;
    try {
      participant = await participantsBroker.getParticipantById(
        dbClient,
        participantId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (participant === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A participant with id: ${participantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return h.response(serializeParticipant(apiSettings, participant)).code(200);
  };

export const postParticipantRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Participant> };

    const newParticipant = {
      id: payload.data.id,
      ...payload.data.attributes,
      keys: [],
    } as Participant;

    let getParticipantsResponse: { count: number };
    try {
      getParticipantsResponse = await participantsBroker.getParticipants(
        dbClient,
        FIRST_PAGE,
        DEFAULT_PAGE_SIZE,
        {
          email: newParticipant.email,
        }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (getParticipantsResponse.count !== 0) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `Another participant is already using the email address: ${newParticipant.email}.`
            ),
          ],
        })
        .code(400);
    }

    let createdParticipant: Participant | undefined;
    try {
      createdParticipant = await participantsBroker.createParticipant(
        dbClient,
        {
          ...newParticipant,
          password: newParticipant.password
            ? hashUtils.calculateStringHash(newParticipant.password)
            : undefined,
        }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (createdParticipant === undefined) {
      console.error(`unable to create a new participant`);
      return return500(h);
    }

    // todo - notify known participants that a new participant was added

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: createdParticipant.email,
        authParticipantId: createdParticipant.id,
        action: "create-participant",
        result: "success",
        details: {
          is: createdParticipant,
        },
      })
    );

    return h
      .response(serializeParticipant(apiSettings, createdParticipant))
      .header(
        "location",
        `${apiSettings.apiBaseUrl}/participants/${createdParticipant?.id}`
      )
      .code(201);
  };

export const patchParticipantRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { participantId } = request.params;
    const payload = request.payload as { data: ApiData<Participant> };

    if (payload.data.id !== participantId) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `The path participant ID does not match the request body participant ID.`
            ),
          ],
        })
        .code(400);
    }

    let existingParticipant: Participant | undefined;
    try {
      existingParticipant = await participantsBroker.getParticipantById(
        dbClient,
        participantId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (existingParticipant === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A participant with id: ${participantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    if (existingParticipant.id !== authParticipant.id) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildForbiddenError(
              `You are not authorized to update this participant.`
            ),
          ],
        })
        .code(403);
    }

    const updatedParticipant: Participant = {
      id: participantId,
      ...payload.data.attributes,
    } as Participant;

    try {
      await participantsBroker.updateParticipant(dbClient, {
        ...updatedParticipant,
        password: updatedParticipant.password
          ? hashUtils.calculateStringHash(updatedParticipant.password)
          : undefined,
      });
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "update-participant",
        result: "success",
        details: {
          before: existingParticipant,
          after: updatedParticipant,
        },
      })
    );

    return h.response().code(204);
  };

export const deleteParticipantOrganizationRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { organizationId, participantId } = request.params;

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
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    let participant: Participant | undefined;
    try {
      participant = await participantsBroker.getParticipantById(
        dbClient,
        participantId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (participant === undefined) {
      return return404(
        h,
        `A participant with id: ${participantId} was not found.`
      );
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    // todo - validate that that the auth user can do this. probably should be an org administrator.

    try {
      const { rows } =
        await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
          dbClient,
          0,
          DEFAULT_PAGE_SIZE,
          {
            organizationId: organization?.id,
            participantId,
          }
        );

      await Promise.all(
        rows.map(
          async (organizationParticipantRef: OrganizationParticipantRef) => {
            await organizationParticipantRefsBroker.deleteOrganizationParticipantRef(
              dbClient,
              organizationParticipantRef
            );

            console.log(
              JSON.stringify({
                date: new Date().toISOString(),
                authParticipantEmail: authParticipant.email,
                authParticipantId: authParticipant.id,
                action: "delete-organization-participant-reference",
                result: "success",
                details: {
                  was: organizationParticipantRef,
                },
              })
            );

            return;
          }
        )
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return h.response().code(204);
  };

export const getParticipantOrganizationRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { participantId } = request.params;

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
            participantId,
          }
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const organizationIds = getOrganizationParticipantRefsResponse.rows.map(
      (organizationParticipantRef: OrganizationParticipantRef) =>
        organizationParticipantRef.organizationId
    );

    let getOrganizationsResponse: { count: number; rows: Organization[] };
    try {
      getOrganizationsResponse = await organizationsBroker.getOrganizations(
        dbClient,
        pageNumber,
        pageSize,
        { ids: organizationIds }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return h
      .response(
        serializeOrganizations(
          apiSettings,
          getOrganizationsResponse.count,
          pageNumber,
          pageSize,
          getOrganizationsResponse.rows
        )
      )
      .code(200);
  };

export const postParticipantOrganizationsRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Organization>[] };
    const { participantId } = request.params;

    const organizationIds = payload.data.map(
      (apiData: ApiData<Organization>) => apiData.id
    );

    const authParticipant = request.auth.credentials.participant as Participant;

    try {
      await Promise.all(
        organizationIds.map((organizationId: string) => {
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
              action: "post-participant-organization-reference",
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
