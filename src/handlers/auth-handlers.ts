import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import {
  buildInternalServerError,
  buildInvalidAttributeError,
  buildUnauthorizedError,
} from "./error-utils";
import { DbClient, participantsBroker } from "@xilution/todd-coin-brokers";
import { hashUtils } from "@xilution/todd-coin-utils";
import { ApiSettings } from "../types";
import { Participant } from "@xilution/todd-coin-types";
import jwt from "jsonwebtoken";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";

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
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [buildInternalServerError()],
        })
        .code(500);
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

    try {
      const accessToken = jwt.sign(
        {
          participantId: participant?.id,
        },
        jwtSecretKey,
        { expiresIn: "1h" }
      );

      return {
        access: accessToken,
      };
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
