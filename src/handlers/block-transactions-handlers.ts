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
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import {
  serializeBlockTransaction,
  serializeBlockTransactions,
} from "../serializers/block-transaction-serializers";
import { return500 } from "./response-utils";

export const getBlockTransactionsValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
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
      block = await blocksBroker.getBlockById(dbClient, blockId, true);
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
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
      return return500(h);
    }

    const { count, rows } = response;

    return h
      .response(
        serializeBlockTransactions(
          apiSettings,
          count,
          pageNumber,
          pageSize,
          block,
          rows
        )
      )
      .code(200);
  };

export const getBlockTransactionValidationFailAction = (
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

export const getBlockTransactionRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { blockId, blockTransactionId } = request.params;

    let block: Block | undefined;

    try {
      block = await blocksBroker.getBlockById(dbClient, blockId);
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
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

    let blockTransaction: BlockTransaction<TransactionDetails> | undefined;
    try {
      blockTransaction = await transactionsBroker.getBlockTransactionById(
        dbClient,
        blockId,
        blockTransactionId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (blockTransaction === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A block transaction with id: ${blockTransactionId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return h
      .response(serializeBlockTransaction(apiSettings, block, blockTransaction))
      .code(200);
  };
