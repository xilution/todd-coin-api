import {
  DbClient,
  participantKeysBroker,
  participantsBroker,
} from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import { Participant, ParticipantKey } from "@xilution/todd-coin-types";
import {
  buildParticipantKeySerializer,
  buildParticipantKeysSerializer,
} from "./serializer-builders";
import {
  buildBadRequestError,
  buildInternalServerError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";

export const getParticipantKeysValidationFailAction = (
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

export const getParticipantKeysRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { participantId } = request.params;

    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let response: { count: number; rows: ParticipantKey[] };
    try {
      response = await participantKeysBroker.getParticipantKeys(
        dbClient,
        pageNumber,
        pageSize,
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

    const { count, rows } = response;

    return h
      .response(
        await buildParticipantKeysSerializer(
          apiSettings,
          count,
          pageNumber,
          pageSize
        ).serialize(rows)
      )
      .code(200);
  };

export const getParticipantKeyValidationFailAction = (
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

export const getParticipantKeyRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { participantKeyId } = request.params;

    let participantKey: ParticipantKey | undefined;
    try {
      participantKey = await participantKeysBroker.getParticipantKeyById(
        dbClient,
        participantKeyId
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

    if (participantKey === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A participantKey with id: ${participantKeyId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return h
      .response(
        await buildParticipantKeySerializer(apiSettings).serialize(
          participantKey
        )
      )
      .code(200);
  };

export const postParticipantKeyValidationFailAction = (
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

export const postParticipantKeyRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<ParticipantKey> };
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
      h.response({
        jsonapi: { version: "1.0" },
        errors: [
          buildNofFountError(
            `Participant with id: ${participantId} was not found.`
          ),
        ],
      }).code(404);
    }

    // todo - verify that the user can do this.
    // const authParticipant = request.auth.credentials.participant as Participant;

    const newParticipantKey = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as ParticipantKey;

    let createdParticipantKey: ParticipantKey | undefined;
    try {
      createdParticipantKey = await participantKeysBroker.createParticipantKey(
        dbClient,
        participant as Participant,
        newParticipantKey
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
        await buildParticipantKeySerializer(apiSettings).serialize(
          createdParticipantKey
        )
      )
      .header(
        "location",
        `${apiSettings.apiBaseUrl}/participant-keys/${createdParticipantKey?.id}`
      )
      .code(201);
  };

export const patchParticipantKeyValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) => {
        if (errorItem.context?.key === "participantKeyId") {
          return buildInvalidParameterError(errorItem);
        }
        return buildInvalidQueryError(errorItem);
      }),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const patchParticipantKeyRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { participantId, participantKeyId } = request.params;
    const payload = request.payload as { data: ApiData<ParticipantKey> };

    if (payload.data.id !== participantKeyId) {
      h.response({
        jsonapi: { version: "1.0" },
        errors: [
          buildBadRequestError(
            `The path participant ID does not match the request body participant ID.`
          ),
        ],
      }).code(400);
    }

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
      h.response({
        jsonapi: { version: "1.0" },
        errors: [
          buildNofFountError(
            `Participant with id: ${participantId} was not found.`
          ),
        ],
      }).code(404);
    }

    // todo - verify that the user can do this.
    // const authParticipant = request.auth.credentials.participant as Participant;

    const updatedParticipantKey: ParticipantKey = {
      id: participantKeyId,
      ...payload.data.attributes,
    } as ParticipantKey;

    try {
      await participantKeysBroker.updateParticipantKey(
        dbClient,
        updatedParticipantKey
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
