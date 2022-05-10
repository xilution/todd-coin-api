import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import {
  buildBadRequestError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import {
  DbClient,
  participantsBroker,
  transactionsBroker,
} from "@xilution/todd-coin-brokers";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import {
  Participant,
  PendingTransaction,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import {
  serializePendingTransaction,
  serializePendingTransactions,
} from "../serializers/pending-transaction-serializers";
import { return500 } from "./response-utils";

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

    const fromId = request.query["filter[from]"] as string;

    const toId = request.query["filter[to]"] as string;

    let response: {
      count: number;
      rows: PendingTransaction<TransactionDetails>[];
    };
    try {
      response = await transactionsBroker.getPendingTransactions(
        dbClient,
        pageNumber,
        pageSize,
        {
          fromId,
          toId,
        }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const { count, rows } = response;

    return h
      .response(
        serializePendingTransactions(
          apiSettings,
          count,
          pageNumber,
          pageSize,
          rows
        )
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
      return return500(h);
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
      .response(serializePendingTransaction(apiSettings, pendingTransaction))
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

    const fromParticipantId = (
      payload.data.relationships.fromParticipant.data as ApiData<Participant>
    ).id;

    let fromParticipant: Participant | undefined;
    try {
      fromParticipant = await participantsBroker.getParticipantById(
        dbClient,
        fromParticipantId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (fromParticipant === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A participant with id: ${fromParticipantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const toParticipantId = (
      payload.data.relationships.toParticipant.data as ApiData<Participant>
    ).id;

    let toParticipant: Participant | undefined;
    try {
      toParticipant = await participantsBroker.getParticipantById(
        dbClient,
        toParticipantId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (toParticipant === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A participant with id: ${toParticipantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    if (toParticipant.id !== authParticipant.id) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `The to participant must be the same as the authenticated participant.`
            ),
          ],
        })
        .code(400);
    }

    const newPendingTransaction = {
      id: payload.data.id,
      ...payload.data.attributes,
      from: {
        id: fromParticipantId,
      },
      to: {
        id: toParticipantId,
      },
    } as PendingTransaction<TransactionDetails>;

    // todo - check for duplicate pending transactions (rules?)

    let createdPendingTransaction: PendingTransaction<TransactionDetails>;
    try {
      createdPendingTransaction =
        (await transactionsBroker.createPendingTransaction(
          dbClient,
          newPendingTransaction
        )) as PendingTransaction<TransactionDetails>;
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "create-pending-transaction",
        result: "success",
        details: {
          is: createdPendingTransaction,
        },
      })
    );

    return h
      .response(
        serializePendingTransaction(apiSettings, createdPendingTransaction)
      )
      .header(
        "location",
        `${apiSettings.apiBaseUrl}/pending-transactions/${createdPendingTransaction?.id}`
      )
      .code(201);
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

    if (payload.data.id !== pendingTransactionId) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `The path pendingTransaction ID does not match the request body pendingTransaction ID.`
            ),
          ],
        })
        .code(400);
    }

    let existingPendingTransaction:
      | PendingTransaction<TransactionDetails>
      | undefined;
    try {
      existingPendingTransaction =
        await transactionsBroker.getPendingTransactionById(
          dbClient,
          pendingTransactionId
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
              `A pendingTransaction with id: ${pendingTransactionId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const fromParticipantId = (
      payload.data.relationships.from.data as ApiData<Participant>
    ).id;

    let fromParticipant: Participant | undefined;
    try {
      fromParticipant = await participantsBroker.getParticipantById(
        dbClient,
        fromParticipantId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (fromParticipant === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A participant with id: ${fromParticipantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const toParticipantId = (
      payload.data.relationships.to.data as ApiData<Participant>
    ).id;

    let toParticipant: Participant | undefined;
    try {
      toParticipant = await participantsBroker.getParticipantById(
        dbClient,
        toParticipantId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (toParticipant === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A participant with id: ${toParticipantId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    if (toParticipant.id !== authParticipant.id) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `The to participant must be the same as the authenticated participant.`
            ),
          ],
        })
        .code(400);
    }

    const updatedPendingTransaction: PendingTransaction<TransactionDetails> = {
      id: pendingTransactionId,
      ...payload.data.attributes,
      from: {
        id: fromParticipantId,
      },
      to: {
        id: toParticipantId,
      },
    } as PendingTransaction<TransactionDetails>;

    try {
      await transactionsBroker.updatePendingTransaction(
        dbClient,
        updatedPendingTransaction
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
        action: "update-pending-transaction",
        result: "success",
        details: {
          before: existingPendingTransaction,
          after: updatedPendingTransaction,
        },
      })
    );

    return h.response().code(204);
  };

export const deletePendingTransactionValidationFailAction = (
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

export const deletePendingTransactionRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { pendingTransactionId } = request.params;

    let existingPendingTransaction:
      | PendingTransaction<TransactionDetails>
      | undefined;
    try {
      existingPendingTransaction =
        await transactionsBroker.getPendingTransactionById(
          dbClient,
          pendingTransactionId
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
              `A pending transaction with id: ${pendingTransactionId} was not found.`
            ),
          ],
        })
        .code(404);
    }
    try {
      await transactionsBroker.deletePendingTransactionById(
        dbClient,
        pendingTransactionId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const authParticipant = request.auth.credentials.participant as Participant;
    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "delete-pending-transaction",
        result: "success",
        details: {
          was: existingPendingTransaction,
        },
      })
    );

    return h.response().code(204);
  };
