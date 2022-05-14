import {
  DbClient,
  OrganizationParticipantRef,
  organizationParticipantRefsBroker,
  organizationsBroker,
  participantKeysBroker,
  transactionsBroker,
} from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import {
  Organization,
  Participant,
  ParticipantKey,
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
import { return403, return404, return500 } from "./response-utils";
import { keyUtils, transactionUtils } from "@xilution/todd-coin-utils";
import { isSignedTransactionValid } from "@xilution/todd-coin-utils/dist/transaction-utils";

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

export const postSignedTransactionRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as {
      data: ApiData<SignedTransaction<TransactionDetails>>;
    };

    // todo - don't allow a signed transaction to be posted twice

    const participantKeyId = (
      payload.data.relationships.participantKey?.data as ApiData<ParticipantKey>
    )?.id;

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
      return return404(
        h,
        `A ParticipantKey with id: ${participantKeyId} was not found.`
      );
    }

    const existingPendingTransactionId: string = payload.data.id;

    let existingPendingTransaction:
      | PendingTransaction<TransactionDetails>
      | undefined;
    try {
      existingPendingTransaction =
        await transactionsBroker.getPendingTransactionById(
          dbClient,
          existingPendingTransactionId
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (existingPendingTransaction === undefined) {
      return return404(
        h,
        `A pending transaction with id: ${existingPendingTransactionId} was not found.`
      );
    }

    const newSignedTransaction = {
      ...existingPendingTransaction,
      goodPoints: payload.data.attributes.goodPoints,
      signature: payload.data.attributes.signature,
      participantKey,
    } as SignedTransaction<TransactionDetails>;

    if (!isSignedTransactionValid(newSignedTransaction)) {
      return return403(
        h,
        `You are not authorized to create this signed transaction because the signature is not valid.`
      );
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    if (
      existingPendingTransaction.fromParticipant &&
      existingPendingTransaction.fromParticipant.id !== authParticipant.id
    ) {
      return return403(
        h,
        `You are not authorized to create this signed transaction because you are not the from participant on the source pending transaction.`
      );
    }

    if (existingPendingTransaction.fromOrganization) {
      let getOrganizationParticipantRefsResponse: { count: number };
      try {
        getOrganizationParticipantRefsResponse =
          await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
            dbClient,
            0,
            DEFAULT_PAGE_SIZE,
            {
              organizationId: existingPendingTransaction.fromOrganization.id,
              participantId: authParticipant.id,
              isAuthorizedSigner: true,
            }
          );
      } catch (error) {
        console.error((error as Error).message);
        return return500(h);
      }

      if (getOrganizationParticipantRefsResponse.count === 0) {
        return return403(
          h,
          `You are not authorized to create this signed transaction because you are not an authorized signer for ${existingPendingTransaction.fromOrganization.name}.`
        );
      }
    }

    if (participantKey?.participant?.id !== authParticipant.id) {
      return return403(
        h,
        `You are not authorized to create this signed transaction because you do not own the participant key.`
      );
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

    const participantKeyId = (
      payload.data.relationships.participantKey?.data as ApiData<ParticipantKey>
    )?.id;

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
      return return404(
        h,
        `A ParticipantKey with id: ${participantKeyId} was not found.`
      );
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

    const updatedSignedTransaction: SignedTransaction<TransactionDetails> = {
      ...existingSignedTransaction,
      goodPoints: payload.data.attributes.goodPoints,
      signature: payload.data.attributes.signature,
      participantKey,
    } as SignedTransaction<TransactionDetails>;

    if (!isSignedTransactionValid(updatedSignedTransaction)) {
      return return403(
        h,
        `You are not authorized to create this signed transaction because the signature is not valid.`
      );
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    if (
      existingSignedTransaction.fromParticipant &&
      existingSignedTransaction.fromParticipant.id !== authParticipant.id
    ) {
      return return403(
        h,
        `You are not authorized to create this signed transaction because you are not the from participant on the source pending transaction.`
      );
    }

    if (existingSignedTransaction.fromOrganization) {
      let getOrganizationParticipantRefsResponse: { count: number };
      try {
        getOrganizationParticipantRefsResponse =
          await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
            dbClient,
            0,
            DEFAULT_PAGE_SIZE,
            {
              organizationId: existingSignedTransaction.fromOrganization.id,
              participantId: authParticipant.id,
              isAuthorizedSigner: true,
            }
          );
      } catch (error) {
        console.error((error as Error).message);
        return return500(h);
      }

      if (getOrganizationParticipantRefsResponse.count === 0) {
        return return403(
          h,
          `You are not authorized to create this signed transaction because you are not an authorized signer for ${existingSignedTransaction.fromOrganization.name}.`
        );
      }
    }

    if (participantKey?.participant?.id !== authParticipant.id) {
      return return403(
        h,
        `You are not authorized to create this signed transaction because you do not own the participant key.`
      );
    }

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
