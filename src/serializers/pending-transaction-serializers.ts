import {
  PendingTransaction,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import { ApiSettings } from "../types";
import { commonOpts, serializeMany, serializeOne } from "./serialization-utils";

// todo - figure out why good points are getting serialized as string in the response.

const collectionName = "pending-transaction";

const buildBaseUrl = (apiSettings: ApiSettings) =>
  `${apiSettings.apiBaseUrl}/pending-transactions`;

const buildOpts = (apiSettings: ApiSettings) => ({
  ...commonOpts,
  dataLinks: {
    self: (pendingTransaction: PendingTransaction<TransactionDetails>) =>
      `${apiSettings.apiBaseUrl}/pending-transactions/${pendingTransaction.id}`,
  },
  attributes: [
    "createdAt",
    "updatedAt",
    "description",
    "type",
    "details",
    "fromParticipant",
    "fromOrganization",
    "toParticipant",
    "toOrganization",
  ],
  typeForAttribute: (attribute: string) => {
    return {
      fromParticipant: "participant",
      fromOrganization: "organization",
      toParticipant: "participant",
      toOrganization: "organization",
    }[attribute];
  },
  fromParticipant: {
    ref: "id",
    relationshipLinks: {
      related: (pendingTransaction: PendingTransaction<TransactionDetails>) =>
        pendingTransaction.fromParticipant
          ? `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.fromParticipant.id}`
          : undefined,
    },
  },
  fromOrganization: {
    ref: "id",
    relationshipLinks: {
      related: (pendingTransaction: PendingTransaction<TransactionDetails>) =>
        pendingTransaction.fromOrganization
          ? `${apiSettings.apiBaseUrl}/organizations/${pendingTransaction.fromOrganization.id}`
          : undefined,
    },
  },
  toParticipant: {
    ref: "id",
    relationshipLinks: {
      related: (pendingTransaction: PendingTransaction<TransactionDetails>) =>
        pendingTransaction.toParticipant
          ? `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.toParticipant.id}`
          : undefined,
    },
  },
  toOrganization: {
    ref: "id",
    relationshipLinks: {
      related: (pendingTransaction: PendingTransaction<TransactionDetails>) =>
        pendingTransaction.toOrganization
          ? `${apiSettings.apiBaseUrl}/organizations/${pendingTransaction.toOrganization.id}`
          : undefined,
    },
  },
});

export const serializePendingTransaction = (
  apiSettings: ApiSettings,
  pendingTransaction: PendingTransaction<TransactionDetails>
) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings);

  return serializeOne(collectionName, opts, baseUrl, pendingTransaction);
};

export const serializePendingTransactions = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number,
  pendingTransactions: PendingTransaction<TransactionDetails>[]
) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings);

  return serializeMany(
    collectionName,
    count,
    pageSize,
    pageNumber,
    opts,
    baseUrl,
    pendingTransactions
  );
};
