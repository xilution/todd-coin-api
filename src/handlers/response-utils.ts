import { buildInternalServerError } from "./error-utils";
import { ResponseObject, ResponseToolkit } from "@hapi/hapi";

export const return500 = (h: ResponseToolkit): ResponseObject => {
  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: [buildInternalServerError()],
    })
    .code(500);
};
