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
      jsonapi: { version: "1.0" },
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
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    const { count, rows } = response;

    return h
      .response(
        await buildPendingTransactionsSerializer(
          apiSettings,
          count,
          pageNumber,
          pageSize
        ).serialize(rows)
      )
      .code(200);
  };

export const getPendingTransactionValidationFailAction = (
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
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (pendingTransaction === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A pending transaction with id: ${pendingTransactionId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return h
      .response(
        await buildPendingTransactionSerializer(apiSettings).serialize(
          pendingTransaction
        )
      )
      .code(200);
  };

export const postPendingTransactionValidationFailAction = (
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

export const postPendingTransactionRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as {
      data: ApiData<PendingTransaction<TransactionDetails>>;
    };

    // todo - validate that the from/to participants exist and can take place in the transaction

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

      return h
        .response(
          await buildPendingTransactionSerializer(apiSettings).serialize(
            createdPendingTransaction
          )
        )
        .header(
          "location",
          `${apiSettings.apiBaseUrl}/pending-transactions/${createdPendingTransaction?.id}`
        )
        .code(201);
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
    }
  };

export const patchPendingTransactionValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) => {
        if (errorItem.context?.key === "pendingTransactionId") {
          return buildInvalidParameterError(errorItem);
        }
        return buildInvalidQueryError(errorItem);
      }),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const patchPendingTransactionRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { pendingTransactionId } = request.params;
    const payload = request.payload as {
      data: ApiData<PendingTransaction<TransactionDetails>>;
    };

    // todo - confirm that the user can do this

    // todo - validate that the from/to participants exist and can take place in the transaction

    const updatedPendingTransaction: PendingTransaction<TransactionDetails> = {
      id: pendingTransactionId,
      ...payload.data.attributes,
    } as PendingTransaction<TransactionDetails>;

    try {
      await transactionsBroker.updatePendingTransaction(
        dbClient,
        updatedPendingTransaction
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
