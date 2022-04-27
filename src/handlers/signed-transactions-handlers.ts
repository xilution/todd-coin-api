import { DbClient } from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import {
  PendingTransaction,
  SignedTransaction,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import { transactionsBroker } from "@xilution/todd-coin-brokers";
import {
  buildSignedTransactionSerializer,
  buildSignedTransactionsSerializer,
} from "./serializer-builders";
import {
  buildInternalServerError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";

export const getSignedTransactionsValidationFailAction = (
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

export const getSignedTransactionsRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let response: {
      count: number;
      rows: SignedTransaction<TransactionDetails>[];
    };
    try {
      response = await transactionsBroker.getSignedTransactions(
        dbClient,
        pageNumber,
        pageSize
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

    return await buildSignedTransactionsSerializer(
      apiSettings,
      count,
      pageNumber,
      pageSize
    ).serialize(rows);
  };

export const getSignedTransactionValidationFailAction = (
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

export const getSignedTransactionRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { signedTransactionId } = request.params;

    let signedTransaction: SignedTransaction<TransactionDetails> | undefined;
    try {
      signedTransaction = await transactionsBroker.getSignedTransactionById(
        dbClient,
        signedTransactionId
      );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (signedTransaction === undefined) {
      return h
        .response({
          errors: [
            buildNofFountError(
              `A signed transaction with id: ${signedTransactionId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return buildSignedTransactionSerializer(apiSettings).serialize(
      signedTransaction
    );
  };

export const postSignedTransactionValidationFailAction = (
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

export const postSignedTransactionRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as {
      data: ApiData<SignedTransaction<TransactionDetails>>;
    };

    const newSignedTransaction = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as SignedTransaction<TransactionDetails>;

    let createdSignedTransaction:
      | SignedTransaction<TransactionDetails>
      | undefined;
    try {
      createdSignedTransaction =
        await transactionsBroker.createSignedTransaction(
          dbClient,
          newSignedTransaction
        );
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    // todo - when the number of signed transactions reaches a threshold, automatically mine a new block

    return buildSignedTransactionSerializer(apiSettings).serialize(
      createdSignedTransaction
    );
  };
