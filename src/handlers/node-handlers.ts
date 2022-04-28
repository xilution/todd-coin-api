import { DbClient, nodesBroker } from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import { Node } from "@xilution/todd-coin-types";
import {
  buildNodeSerializer,
  buildNodesSerializer,
} from "./serializer-builders";
import {
  buildInternalServerError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";

export const getNodesValidationFailAction = (
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
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    const { count, rows } = response;

    return buildNodesSerializer(
      apiSettings,
      count,
      pageNumber,
      pageSize
    ).serialize(rows);
  };

export const getNodeValidationFailAction = (
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

export const getNodeRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { nodeId } = request.params;

    let node: Node | undefined;
    try {
      node = await nodesBroker.getNodeById(dbClient, nodeId);
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    if (node === undefined) {
      return h
        .response({
          errors: [
            buildNofFountError(`A node with id: ${nodeId} was not found.`),
          ],
        })
        .code(404);
    }

    return buildNodeSerializer(apiSettings).serialize(node);
  };

export const postNodeValidationFailAction = (
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

export const postNodeRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Node> };

    // todo - check for dupe nodes

    // todo - once validated, sync up with the new node

    const newNode: Node = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as Node;

    let createdNode: Node | undefined;
    try {
      createdNode = await nodesBroker.createNode(dbClient, newNode);
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    // todo - notify known nodes that a new node was added

    return buildNodeSerializer(apiSettings).serialize(createdNode);
  };

export const patchNodeValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
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

export const patchNodeRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { nodeId } = request.params;
    const payload = request.payload as { data: ApiData<Node> };

    // todo - confirm that the user can do this

    const updatedNode: Node = {
      id: nodeId,
      ...payload.data.attributes,
    } as Node;

    try {
      await nodesBroker.updateNode(dbClient, updatedNode);
    } catch (error) {
      console.error((error as Error).message);
      return h
        .response({
          errors: [buildInternalServerError()],
        })
        .code(500);
    }

    return h.response().code(204);
  };
