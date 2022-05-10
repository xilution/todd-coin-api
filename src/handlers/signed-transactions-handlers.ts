import { DbClient, transactionsBroker } from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import {
  Participant,
  PendingTransaction,
  SignedTransaction,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import {
  buildBadRequestError,
  buildForbiddenError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import {
  serializeSignedTransaction,
  serializeSignedTransactions,
} from "../serializers/signed-transaction-serializers";
import { return500 } from "./response-utils";

export const getSignedTransactionsValidationFailAction = (
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
      return return500(h);
    }

    const { count, rows } = response;

    return h
      .response(
        serializeSignedTransactions(
          apiSettings,
          count,
          pageNumber,
          pageSize,
          rows
        )
      )
      .code(200);
  };

export const getSignedTransactionValidationFailAction = (
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
      return return500(h);
    }

    if (signedTransaction === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A signed transaction with id: ${signedTransactionId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return h
      .response(serializeSignedTransaction(apiSettings, signedTransaction))
      .code(200);
  };

export const postSignedTransactionValidationFailAction = (
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

export const postSignedTransactionRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as {
      data: ApiData<SignedTransaction<TransactionDetails>>;
    };

    // todo - validate the crap out of this.

    const newSignedTransaction = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as SignedTransaction<TransactionDetails>;

    let existingPendingTransaction:
      | PendingTransaction<TransactionDetails>
      | undefined;
    try {
      existingPendingTransaction =
        await transactionsBroker.getPendingTransactionById(
          dbClient,
          newSignedTransaction.id as string
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (existingPendingTransaction === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A pending transaction with id: ${newSignedTransaction.id} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    if (existingPendingTransaction.fromParticipant?.id !== authParticipant.id) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildForbiddenError(
              `Only the from participant can create a signed transaction.`
            ),
          ],
        })
        .code(403);
    }

    let createdSignedTransaction: SignedTransaction<TransactionDetails>;
    try {
      createdSignedTransaction =
        (await transactionsBroker.createSignedTransaction(
          dbClient,
          newSignedTransaction
        )) as SignedTransaction<TransactionDetails>;
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    // todo - when the number of signed transactions reaches a threshold, automatically mine a new block

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "create-signed-transaction",
        result: "success",
        details: {
          is: createdSignedTransaction,
        },
      })
    );

    return h
      .response(
        serializeSignedTransaction(apiSettings, createdSignedTransaction)
      )
      .header(
        "location",
        `${apiSettings.apiBaseUrl}/signed-transactions/${createdSignedTransaction?.id}`
      )
      .code(201);
  };

export const patchSignedTransactionValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) => {
        if (errorItem.context?.key === "signedTransactionId") {
          return buildInvalidParameterError(errorItem);
        }
        return buildInvalidQueryError(errorItem);
      }),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const patchSignedTransactionRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { signedTransactionId } = request.params;
    const payload = request.payload as {
      data: ApiData<SignedTransaction<TransactionDetails>>;
    };

    if (payload.data.id !== signedTransactionId) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `The path signedTransaction ID does not match the request body signedTransaction ID.`
            ),
          ],
        })
        .code(400);
    }

    let existingSignedTransaction:
      | SignedTransaction<TransactionDetails>
      | undefined;
    try {
      existingSignedTransaction =
        await transactionsBroker.getSignedTransactionById(
          dbClient,
          signedTransactionId
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (existingSignedTransaction === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A signedTransaction with id: ${signedTransactionId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    if (existingSignedTransaction.fromParticipant?.id !== authParticipant.id) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildForbiddenError(
              `Only the from participant can update a signed transaction.`
            ),
          ],
        })
        .code(403);
    }

    const updatedSignedTransaction: SignedTransaction<TransactionDetails> = {
      id: signedTransactionId,
      ...payload.data.attributes,
    } as SignedTransaction<TransactionDetails>;

    try {
      await transactionsBroker.updateSignedTransaction(
        dbClient,
        updatedSignedTransaction
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
        action: "update-signed-transaction",
        result: "success",
        details: {
          before: existingSignedTransaction,
          after: updatedSignedTransaction,
        },
      })
    );

    return h.response().code(204);
  };
