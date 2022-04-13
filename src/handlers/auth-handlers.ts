import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import {
  buildInternalServerError,
  buildInvalidAttributeError,
} from "./error-utils";
import { DbClient } from "@xilution/todd-coin-brokers";
import { ec } from "elliptic";
import { keyUtils } from "@xilution/todd-coin-utils";
import { ApiSettings } from "../types";
import { Participant } from "@xilution/todd-coin-types";
import { participantsBroker } from "@xilution/todd-coin-brokers";
import jwt from "jsonwebtoken";

export const authTokenValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: (Boom.Boom & ValidationError) | undefined
) => {
  return h
    .response({
      errors: error.details.map((errorItem: ValidationErrorItem) =>
        buildInvalidAttributeError(errorItem)
      ),
    })
    .code(error.output.statusCode)
    .takeover();
};

export const authTokenRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { privateKey: string };

    const { privateKey } = payload;

    const keyPair: ec.KeyPair = keyUtils.getKeyPairFromPrivateKey(privateKey);
    const publicKey: string = keyPair.getPublic("hex");

    let participant: Participant;
    try {
      participant = await participantsBroker.getParticipantByPublicKey(dbClient, publicKey);
    } catch (error) {
      console.error(error.message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    const { jwtSecretKey } = apiSettings;

    try {
      const accessToken = jwt.sign(
        {
          participantId: participant.id,
        },
        jwtSecretKey,
        { expiresIn: "1h" }
      );

      return {
        access: accessToken,
      };
    } catch (error) {
      console.error(error.message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }
  };
