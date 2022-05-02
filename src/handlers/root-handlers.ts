import { ApiSettings } from "../types";
import { DbClient } from "@xilution/todd-coin-brokers";
import { TODD_COIN_DESCRIPTION } from "../routes/messages";
import { buildAuthenticationInstructions } from "../routes/message-builders";

export const getRoot =
  (dbClient: DbClient, apiSettings: ApiSettings) => async () => {
    const { apiBaseUrl, hostMaintainerId } = apiSettings;

    return {
      jsonapi: {
        version: "1.0",
      },
      links: {
        self: apiBaseUrl,
        metrics: `${apiBaseUrl}/metrics`,
        documentation: `${apiBaseUrl}/documentation`,
        swagger: `${apiBaseUrl}/swagger.json`,
      },
      data: {
        attributes: {
          // todo - add server start time, location, etc.
          description: TODD_COIN_DESCRIPTION,
          authentication: buildAuthenticationInstructions(apiBaseUrl),
        },
        relationships: {
          // todo - add some paginated blocks data (id only)
          blocks: {
            links: {
              related: `${apiBaseUrl}/blocks`,
            },
          },
          nodes: {
            // todo - add some paginated nodes data (id only)
            links: {
              related: `${apiBaseUrl}/nodes`,
            },
          },
          participants: {
            // todo - add some paginated participants data (id only)
            links: {
              related: `${apiBaseUrl}/participants`,
            },
          },
          pendingTransactions: {
            // todo - add some paginated pending transactions data (id only)
            links: {
              related: `${apiBaseUrl}/pending-transactions`,
            },
          },
          signedTransactions: {
            // todo - add some paginated signed transactions data (id only)
            links: {
              related: `${apiBaseUrl}/signed-transactions`,
            },
          },
          hostMaintainer: {
            data: {
              type: "participant",
              id: hostMaintainerId,
            },
            links: {
              related: `${apiBaseUrl}/participants/${hostMaintainerId}`,
            },
          },
        },
      },
    };
  };
