import { DbClient, nodesBroker } from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import { Node, Participant } from "@xilution/todd-coin-types";
import {
  buildBadRequestError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import { serializeNode, serializeNodes } from "../serializers/node-serializers";
import { return500 } from "./response-utils";

export const getNodesValidationFailAction = (
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

export const getNodeValidationFailAction = (
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

export const postNodeValidationFailAction = (
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

export const patchNodeValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) => {
        if (errorItem.context?.key === "nodeId") {
          return buildInvalidParameterError(errorItem);
        }
        return buildInvalidQueryError(errorItem);
      }),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const getNodesRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let response: { count: number; rows: Node[] } | undefined;
    try {
      response = await nodesBroker.getNodes(dbClient, pageNumber, pageSize);
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const { count, rows } = response;

    return h
      .response(serializeNodes(apiSettings, count, pageNumber, pageSize, rows))
      .code(200);
  };

export const getNodeRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { nodeId } = request.params;

    let node: Node | undefined;
    try {
      node = await nodesBroker.getNodeById(dbClient, nodeId);
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (node === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(`A node with id: ${nodeId} was not found.`),
          ],
        })
        .code(404);
    }

    return h.response(serializeNode(apiSettings, node)).code(200);
  };

export const postNodeRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Node> };

    // todo - once validated, sync up with the new node

    const newNode: Node = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as Node;

    let getNodesResponse: { count: number };
    try {
      getNodesResponse = await nodesBroker.getNodes(
        dbClient,
        FIRST_PAGE,
        DEFAULT_PAGE_SIZE,
        {
          baseUrl: newNode.baseUrl,
        }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (getNodesResponse.count !== 0) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `Another node is already using the base URL: ${newNode.baseUrl}.`
            ),
          ],
        })
        .code(400);
    }

    let createdNode: Node;
    try {
      createdNode = (await nodesBroker.createNode(dbClient, newNode)) as Node;
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    // todo - notify known nodes that a new node was added

    const authParticipant = request.auth.credentials.participant as Participant;
    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "create-node",
        result: "success",
        details: {
          is: createdNode,
        },
      })
    );

    return h
      .response(serializeNode(apiSettings, createdNode))
      .header("location", `${apiSettings.apiBaseUrl}/nodes/${createdNode?.id}`)
      .code(201);
  };

export const patchNodeRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { nodeId } = request.params;
    const payload = request.payload as { data: ApiData<Node> };

    if (payload.data.id !== nodeId) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `The path node ID does not match the request body node ID.`
            ),
          ],
        })
        .code(400);
    }

    let existingNode: Node | undefined;
    try {
      existingNode = await nodesBroker.getNodeById(dbClient, nodeId);
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (existingNode === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(`A node with id: ${nodeId} was not found.`),
          ],
        })
        .code(404);
    }

    const updatedNode: Node = {
      id: nodeId,
      ...payload.data.attributes,
    } as Node;

    try {
      await nodesBroker.updateNode(dbClient, updatedNode);
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
        action: "update-node",
        result: "success",
        details: {
          before: existingNode,
          after: updatedNode,
        },
      })
    );

    return h.response().code(204);
  };
