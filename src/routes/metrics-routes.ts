import { Request, ResponseToolkit, Server } from "@hapi/hapi";
import { getContentType, getSummary } from "@promster/hapi";

export const addMetricsRoutes = (server: Server): void => {
  server.route({
    method: "GET",
    path: "/metrics",
    handler: async (request: Request, h: ResponseToolkit) => {
      return h
        .response(await getSummary())
        .code(200)
        .header("content-type", getContentType());
    },
  });
};
