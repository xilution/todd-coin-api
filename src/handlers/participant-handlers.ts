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
  buildOrganizationsSerializer,
  buildParticipantSerializer,
  buildParticipantsSerializer,
} from "./serializer-builders";
import { hashUtils } from "@xilution/todd-coin-utils";
import {
  buildBadRequestError,
  buildForbiddenError,
  buildInternalServerError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";

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
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    const { count, rows } = response;

    return h
      .response(
        await buildParticipantsSerializer(
          apiSettings,
          count,
          pageNumber,
          pageSize
        ).serialize(rows)
      )
      .code(200);
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
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
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

    return h
      .response(
        await buildParticipantSerializer(apiSettings).serialize(participant)
      )
      .code(200);
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
        await organizationParticipantRefsBroker.getOrganizationParticipantRefByParticipantId(
          dbClient,
          participantId
        );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
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
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    return h
      .response(
        await buildOrganizationsSerializer(
          apiSettings,
          getOrganizationsResponse.count,
          pageNumber,
          pageSize
        ).serialize(getOrganizationsResponse.rows)
      )
      .code(200);
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
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
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
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (createdParticipant === undefined) {
      console.error(`unable to create a new participant`);
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    // todo - notify known participants that a new participant was added

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        participant: createdParticipant,
        action: "create-participant",
        result: "success",
        details: {
          is: createdParticipant,
        },
      })
    );

    return h
      .response(
        await buildParticipantSerializer(apiSettings).serialize(
          createdParticipant
        )
      )
      .header(
        "location",
        `${apiSettings.apiBaseUrl}/participants/${createdParticipant?.id}`
      )
      .code(201);
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
          const newOrganizationParticipantRef = {
            participantId,
            organizationId,
          };

          console.log(
            JSON.stringify({
              date: new Date().toISOString(),
              participant: authParticipant,
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
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    return h.response().code(204);
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
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
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
              `You are not allowed to update this participant.`
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
      // todo - what if the user is changing their email or password?
      await participantsBroker.updateParticipant(dbClient, {
        ...updatedParticipant,
        password: updatedParticipant.password
          ? hashUtils.calculateStringHash(updatedParticipant.password)
          : undefined,
      });
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        participant: authParticipant,
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
