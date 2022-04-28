import {
  blocksBroker,
  DbClient,
  transactionsBroker,
} from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiSettings } from "../types";
import {
  Block,
  BlockTransaction,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import {
  buildBlockTransactionSerializer,
  buildBlockTransactionsSerializer,
} from "./serializer-builders";
import {
  buildInternalServerError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";

export const getBlockTransactionsValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      errors: validationError.details.map((errorItem: ValidationErrorItem) => {
        if (errorItem.context?.key === "blockId") {
          return buildInvalidParameterError(errorItem);
        }
        return buildInvalidQueryError(errorItem);
      }),
    })
    .code(validationError.output.statusCode || 400)
    .takeover();
};

export const getBlockTransactionsRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { blockId } = request.params;

    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let block: Block | undefined;

    try {
      block = await blocksBroker.getBlockById(dbClient, blockId);
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (block === undefined) {
      return h
        .response({
          errors: [
            buildNofFountError(`A block with id: ${blockId} was not found.`),
          ],
        })
        .code(404);
    }

    let response: {
      count: number;
      rows: BlockTransaction<TransactionDetails>[];
    };
    try {
      response = await transactionsBroker.getBlockTransactions(
        dbClient,
        pageNumber,
        pageSize,
        blockId
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

    return await buildBlockTransactionsSerializer(
      apiSettings,
      block,
      count,
      pageNumber,
      pageSize
    ).serialize(rows);
  };

export const getBlockTransactionValidationFailAction = (
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

export const getBlockTransactionRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { blockId, blockTransactionId } = request.params;

    let block: Block | undefined;

    try {
      block = await blocksBroker.getBlockById(dbClient, blockId);
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (block === undefined) {
      return h
        .response({
          errors: [
            buildNofFountError(`A block with id: ${blockId} was not found.`),
          ],
        })
        .code(404);
    }

    let blockTransaction: BlockTransaction<TransactionDetails> | undefined;
    try {
      blockTransaction = await transactionsBroker.getBlockTransactionById(
        dbClient,
        blockId,
        blockTransactionId
      );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (blockTransaction === undefined) {
      return h
        .response({
          errors: [
            buildNofFountError(
              `A block transaction with id: ${blockTransactionId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return buildBlockTransactionSerializer(apiSettings, block).serialize(
      blockTransaction
    );
  };