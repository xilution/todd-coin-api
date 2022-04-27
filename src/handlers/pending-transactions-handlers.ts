import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import {
  buildInternalServerError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import { DbClient, transactionsBroker } from "@xilution/todd-coin-brokers";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import {
  PendingTransaction,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import {
  buildPendingTransactionSerializer,
  buildPendingTransactionsSerializer,
} from "./serializer-builders";

export const getPendingTransactionsValidationFailAction = (
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

export const getPendingTransactionsRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    const fromFilter: string = request.query["filter[from]"];

    const toFilter: string = request.query["filter[to]"];

    let response: {
      count: number;
      rows: PendingTransaction<TransactionDetails>[];
    };
    try {
      response = await transactionsBroker.getPendingTransactions(
        dbClient,
        pageNumber,
        pageSize,
        fromFilter,
        toFilter
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

    return await buildPendingTransactionsSerializer(
      apiSettings,
      count,
      pageNumber,
      pageSize
    ).serialize(rows);
  };

export const getPendingTransactionValidationFailAction = (
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

export const getPendingTransactionRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { pendingTransactionId } = request.params;

    let pendingTransaction: PendingTransaction<TransactionDetails> | undefined;
    try {
      pendingTransaction = await transactionsBroker.getPendingTransactionById(
        dbClient,
        pendingTransactionId
      );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (pendingTransaction === undefined) {
      return h
        .response({
          errors: [
            buildNofFountError(
              `A pending transaction with id: ${pendingTransactionId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return buildPendingTransactionSerializer(apiSettings).serialize(
      pendingTransaction
    );
  };

export const postPendingTransactionValidationFailAction = (
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

export const postPendingTransactionRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as {
      data: ApiData<PendingTransaction<TransactionDetails>>;
    };

    const newPendingTransaction = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as PendingTransaction<TransactionDetails>;

    // todo - check for duplicate pending transactions (rules?)

    try {
      const createdPendingTransaction:
        | PendingTransaction<TransactionDetails>
        | undefined = await transactionsBroker.createPendingTransaction(
        dbClient,
        newPendingTransaction
      );

      return buildPendingTransactionSerializer(apiSettings).serialize(
        createdPendingTransaction
      );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }
  };
