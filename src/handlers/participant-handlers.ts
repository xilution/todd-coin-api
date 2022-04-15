import { DbClient } from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import { Participant } from "@xilution/todd-coin-types";
import { participantsBroker } from "@xilution/todd-coin-brokers";
import {
  buildParticipantSerializer,
  buildParticipantsSerializer,
} from "./serializer-builders";
import { keyUtils } from "@xilution/todd-coin-utils";
import {
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

    const publicKeyFilter: string = request.query["filter[publicKey]"];

    let response: { count: number; rows: Participant[] };
    try {
      response = await participantsBroker.getParticipants(
        dbClient,
        pageNumber,
        pageSize,
        publicKeyFilter
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

    return buildParticipantsSerializer(
      apiSettings,
      count,
      pageNumber,
      pageSize
    ).serialize(rows);
  };

export const getParticipantValidationFailAction = (
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
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (participant === undefined) {
      return h
        .response({
          errors: [
            buildNofFountError(
              `A participant with id: ${participantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return buildParticipantSerializer(apiSettings).serialize(participant);
  };

export const postParticipantValidationFailAction = (
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

export const postParticipantRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Participant> };

    // todo - check for dupe participants

    const participantKey = keyUtils.generateParticipantKey();

    const newParticipant = {
      id: payload.data.id,
      ...payload.data.attributes,
      key: { public: participantKey.public },
    };

    let createdParticipant: Participant | undefined;
    try {
      createdParticipant = await participantsBroker.createParticipant(
        dbClient,
        newParticipant
      );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (createdParticipant === undefined) {
      console.error(`unable to create a new participant`);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    // todo - notify known participants that a new participant was added

    return buildParticipantSerializer(apiSettings).serialize({
      ...createdParticipant,
      key: {
        public: createdParticipant.key.public,
        private: participantKey.private,
      },
    });
  };
