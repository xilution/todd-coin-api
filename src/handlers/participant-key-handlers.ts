import { DbClient, participantKeysBroker } from "@xilution/todd-coin-brokers";
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
  buildInternalServerError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import { keyUtils } from "@xilution/todd-coin-utils";

export const getParticipantKeysValidationFailAction = (
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

export const getParticipantKeysRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let response: { count: number; rows: ParticipantKey[] };
    try {
      response = await participantKeysBroker.getParticipantKeys(
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
    const participant = request.auth.credentials.participant as Participant;

    const newParticipantKey = keyUtils.generateParticipantKey();

    let createdParticipantKey: ParticipantKey | undefined;
    try {
      createdParticipantKey = await participantKeysBroker.createParticipantKey(
        dbClient,
        participant,
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
    const { participantKeyId } = request.params;
    const payload = request.payload as { data: ApiData<ParticipantKey> };

    // todo - confirm that the user can do this

    const updatedParticipantKey: ParticipantKey = {
      id: participantKeyId,
      ...payload.data.attributes,
    } as ParticipantKey;

    try {
      await participantKeysBroker.deactivateParticipantKey(
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
