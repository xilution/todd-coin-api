import { Request, ResponseToolkit } from "@hapi/hapi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import {
  blocksBroker,
  DbClient,
  participantKeysBroker,
} from "@xilution/todd-coin-brokers";
import {
  buildBadRequestError,
  buildInternalServerError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import {
  Block,
  BlockTransaction,
  Participant,
  ParticipantKey,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import {
  serializeBlock,
  serializeBlocks,
} from "../serializers/block-serializers";

export const getBlocksValidationFailAction = (
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

export const getBlocksRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let response: { count: number; rows: Block[] };

    try {
      response = await blocksBroker.getBlocks(dbClient, pageNumber, pageSize);
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
      .response(serializeBlocks(apiSettings, count, pageNumber, pageSize, rows))
      .code(200);
  };

export const getBlockValidationFailAction = (
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

export const getBlockRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { blockId } = request.params;

    let block: Block | undefined;
    try {
      block = await blocksBroker.getBlockById(dbClient, blockId);
    } catch (error) {
      console.error(error);
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (block === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(`A block with id: ${blockId} was not found.`),
          ],
        })
        .code(404);
    }

    return h.response(serializeBlock(apiSettings, block)).code(200);
  };

export const postBlockValidationFailAction = (
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

export const postBlockRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as {
      data: {
        id: string;
        attributes: Record<string, string | number | boolean | object>;
        relationships: {
          transactions: Array<{
            data: ApiData<BlockTransaction<TransactionDetails>>;
          }>;
        };
      };
    };

    const authParticipant = request.auth.credentials.participant as Participant;

    const participantKey: ParticipantKey | undefined =
      await participantKeysBroker.getEffectiveParticipantKeyByParticipant(
        dbClient,
        authParticipant
      );

    if (participantKey === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `Unable to post a new block because the miner does not have an effective key.`
            ),
          ],
        })
        .code(400);
    }

    const newBlock = {
      id: payload.data.id,
      ...payload.data.attributes,
      transactions: payload.data.relationships.transactions.map(
        (transactionData: {
          data: ApiData<BlockTransaction<TransactionDetails>>;
        }) => ({
          id: transactionData.data.id,
          ...transactionData.data.attributes,
        })
      ),
    } as Block;

    // todo - validate that the new block can be added to the chain

    let createdBlock: Block;
    try {
      createdBlock = (await blocksBroker.createBlock(
        dbClient,
        newBlock,
        participantKey.public
      )) as Block;
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    // todo - notify known blocks that a new block was added

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "create-block",
        result: "success",
        details: {
          is: createdBlock,
        },
      })
    );

    return h
      .response(serializeBlock(apiSettings, createdBlock))
      .header(
        "location",
        `${apiSettings.apiBaseUrl}/blocks/${createdBlock?.id}`
      )
      .code(201);
  };
