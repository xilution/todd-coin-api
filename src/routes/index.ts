import { Server } from "@hapi/hapi";
import { DbClient } from "@xilution/todd-coin-brokers";
import { addRootRoutes } from "./root-routes";
import { addAuthRoutes } from "./auth-routes";
import { addBlocksRoutes } from "./blocks-routes";
import { addPendingTransactionsRoutes } from "./pending-transactions-routes";
import { addSignedTransactionsRoutes } from "./signed-transactions-routes";
import { addBlockTransactionsRoutes } from "./block-transactions-routes";
import { addParticipantRoutes } from "./participants-routes";
import { addParticipantKeyRoutes } from "./participant-keys-routes";
import { addOrganizationsRoutes } from "./organizations-routes";
import { addNodesRoutes } from "./nodes-routes";
import { ApiSettings } from "../types";
import { addMetricsRoutes } from "./metrics-routes";

export const addRoutes = (
  server: Server,
  dbClient: DbClient,
  apiSettings: ApiSettings
): void => {
  addRootRoutes(server, dbClient, apiSettings);
  addAuthRoutes(server, dbClient, apiSettings);
  addBlocksRoutes(server, dbClient, apiSettings);
  addMetricsRoutes(server);
  addPendingTransactionsRoutes(server, dbClient, apiSettings);
  addSignedTransactionsRoutes(server, dbClient, apiSettings);
  addBlockTransactionsRoutes(server, dbClient, apiSettings);
  addParticipantRoutes(server, dbClient, apiSettings);
  addParticipantKeyRoutes(server, dbClient, apiSettings);
  addOrganizationsRoutes(server, dbClient, apiSettings);
  addNodesRoutes(server, dbClient, apiSettings);
};
