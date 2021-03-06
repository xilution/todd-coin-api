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
  buildBadRequestError,
  buildForbiddenError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import {
  serializeParticipantKey,
  serializeParticipantKeys,
} from "../serializers/participant-key-serializers";
import { return500 } from "./response-utils";

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

export const getParticipantKeysRequestHandler =
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
              `Participant with id: ${participantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

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
      return return500(h);
    }

    const { count, rows } = response;

    return h
      .response(
        serializeParticipantKeys(
          apiSettings,
          count,
          pageNumber,
          pageSize,
          participant,
          rows
        )
      )
      .code(200);
  };

export const getParticipantKeyRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { participantId, participantKeyId } = request.params;

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
              `Participant with id: ${participantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    let participantKey: ParticipantKey | undefined;
    try {
      participantKey = await participantKeysBroker.getParticipantKeyById(
        dbClient,
        participantKeyId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
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
        serializeParticipantKey(apiSettings, participant, participantKey)
      )
      .code(200);
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
      return return500(h);
    }

    if (participant === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `Participant with id: ${participantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    if (participant.id !== authParticipant.id) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildForbiddenError(
              `You are not authorized to create a participant key for this participant.`
            ),
          ],
        })
        .code(403);
    }

    const newParticipantKey = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as ParticipantKey;

    let getParticipantKeysResponse: { count: number };
    try {
      getParticipantKeysResponse =
        await participantKeysBroker.getParticipantKeys(
          dbClient,
          FIRST_PAGE,
          DEFAULT_PAGE_SIZE,
          participantId,
          {
            publicKey: newParticipantKey.public,
          }
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (getParticipantKeysResponse.count !== 0) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `Another participant key already exists with the public key: ${newParticipantKey.public}.`
            ),
          ],
        })
        .code(400);
    }

    let createdParticipantKey: ParticipantKey;
    try {
      console.log(`newParticipantKey: ${JSON.stringify(newParticipantKey)}`);
      createdParticipantKey = (await participantKeysBroker.createParticipantKey(
        dbClient,
        participant as Participant,
        newParticipantKey
      )) as ParticipantKey;
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "create-participant-key",
        result: "success",
        details: {
          is: createdParticipantKey,
        },
      })
    );

    return h
      .response(
        serializeParticipantKey(apiSettings, participant, createdParticipantKey)
      )
      .header(
        "location",
        `${apiSettings.apiBaseUrl}/participant-keys/${createdParticipantKey?.id}`
      )
      .code(201);
  };

export const patchParticipantKeyRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { participantId, participantKeyId } = request.params;
    const payload = request.payload as { data: ApiData<ParticipantKey> };

    if (payload.data.id !== participantKeyId) {
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

    let existingParticipantKey: ParticipantKey | undefined;
    try {
      existingParticipantKey =
        await participantKeysBroker.getParticipantKeyById(
          dbClient,
          participantKeyId
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (existingParticipantKey === undefined) {
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
              `Participant with id: ${participantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    if (participant.id !== authParticipant.id) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildForbiddenError(
              `You are not authorized to update this participant key for this participant.`
            ),
          ],
        })
        .code(403);
    }

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
      return return500(h);
    }

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "update-participant-key",
        result: "success",
        details: {
          before: existingParticipantKey,
          after: updatedParticipantKey,
        },
      })
    );

    return h.response().code(204);
  };
