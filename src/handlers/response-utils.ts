import {
  buildBadRequestError,
  buildForbiddenError,
  buildInternalServerError,
  buildNofFountError,
} from "./error-utils";
import { ResponseObject, ResponseToolkit } from "@hapi/hapi";

export const return400 = (
  h: ResponseToolkit,
  detail: string
): ResponseObject => {
  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: [buildBadRequestError(detail)],
    })
    .code(400);
};

export const return403 = (
  h: ResponseToolkit,
  detail: string
): ResponseObject => {
  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: [buildForbiddenError(detail)],
    })
    .code(403);
};

export const return404 = (
  h: ResponseToolkit,
  detail: string
): ResponseObject => {
  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: [buildNofFountError(detail)],
    })
    .code(404);
};

export const return500 = (h: ResponseToolkit): ResponseObject => {
  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: [buildInternalServerError()],
    })
    .code(500);
};
