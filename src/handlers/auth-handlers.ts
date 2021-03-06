import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import {
  buildInvalidAttributeError,
  buildUnauthorizedError,
} from "./error-utils";
import { DbClient, participantsBroker } from "@xilution/todd-coin-brokers";
import { hashUtils } from "@xilution/todd-coin-utils";
import { ApiSettings } from "../types";
import { Participant } from "@xilution/todd-coin-types";
import jwt from "jsonwebtoken";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { return500 } from "./response-utils";
import { serializeParticipant } from "../serializers/participants-serializers";

export const authTokenValidationFailAction = (
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

export const authUserValidationFailAction = (
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

export const authTokenRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { email: string; password: string };

    const { email, password } = payload;

    let getParticipantsResponse: { count: number; rows: Participant[] };
    try {
      getParticipantsResponse = await participantsBroker.getParticipants(
        dbClient,
        FIRST_PAGE,
        DEFAULT_PAGE_SIZE,
        {
          email,
        }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const participant: Participant | undefined =
      getParticipantsResponse.rows.find(
        (participant: Participant) =>
          participant.password === hashUtils.calculateStringHash(password)
      );

    if (participant === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildUnauthorizedError("Authentication failed.")],
        })
        .code(401);
    }

    const { jwtSecretKey } = apiSettings;

    let accessToken: string;
    try {
      accessToken = jwt.sign(
        {
          participantId: participant?.id,
        },
        jwtSecretKey,
        { expiresIn: "1h" }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: participant.email,
        authParticipantId: participant.id,
        action: "authentication",
        result: "success",
      })
    );

    return {
      access: accessToken,
    };
  };

export const authUserRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const authParticipant = request.auth.credentials.participant as Participant;

    return h
      .response(serializeParticipant(apiSettings, authParticipant))
      .code(200);
  };
