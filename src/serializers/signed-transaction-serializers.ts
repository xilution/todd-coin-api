import {
  BlockTransaction,
  SignedTransaction,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import { ApiSettings } from "../types";
import { commonOpts, serializeMany, serializeOne } from "./serialization-utils";

const collectionName = "signed-transaction";

const buildBaseUrl = (apiSettings: ApiSettings) =>
  `${apiSettings.apiBaseUrl}/signed-transactions`;

const buildOpts = (apiSettings: ApiSettings) => ({
  ...commonOpts,
  dataLinks: {
    self: (signedTransaction: SignedTransaction<TransactionDetails>) =>
      `${apiSettings.apiBaseUrl}/signed-transactions/${signedTransaction.id}`,
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
    "goodPoints",
    "signature",
    "participantKey",
  ],
  typeForAttribute: (attribute: string) => {
    return {
      fromParticipant: "participant",
      fromOrganization: "organization",
      toParticipant: "participant",
      toOrganization: "organization",
      participantKey: "participant-key",
    }[attribute];
  },
  fromParticipant: {
    ref: "id",
    relationshipLinks: {
      related: (signedTransaction: SignedTransaction<TransactionDetails>) =>
        signedTransaction.fromParticipant
          ? `${apiSettings.apiBaseUrl}/participants/${signedTransaction.fromParticipant.id}`
          : undefined,
    },
  },
  fromOrganization: {
    ref: "id",
    relationshipLinks: {
      related: (signedTransaction: SignedTransaction<TransactionDetails>) =>
        signedTransaction.fromOrganization
          ? `${apiSettings.apiBaseUrl}/organizations/${signedTransaction.fromOrganization.id}`
          : undefined,
    },
  },
  toParticipant: {
    ref: "id",
    relationshipLinks: {
      related: (signedTransaction: SignedTransaction<TransactionDetails>) =>
        signedTransaction.toParticipant
          ? `${apiSettings.apiBaseUrl}/participants/${signedTransaction.toParticipant.id}`
          : undefined,
    },
  },
  toOrganization: {
    ref: "id",
    relationshipLinks: {
      related: (signedTransaction: SignedTransaction<TransactionDetails>) =>
        signedTransaction.toOrganization
          ? `${apiSettings.apiBaseUrl}/organizations/${signedTransaction.toOrganization.id}`
          : undefined,
    },
  },
  participantKey: {
    ref: "id",
    relationshipLinks: {
      related: (blockTransaction: BlockTransaction<TransactionDetails>) =>
        blockTransaction.participantKey
          ? `${apiSettings.apiBaseUrl}/participants/${blockTransaction.participantKey.participant?.id}/${blockTransaction.participantKey.id}`
          : undefined,
    },
  },
});

export const serializeSignedTransaction = (
  apiSettings: ApiSettings,
  signedTransaction: SignedTransaction<TransactionDetails>
) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings);

  return serializeOne(collectionName, opts, baseUrl, signedTransaction);
};

export const serializeSignedTransactions = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number,
  signedTransactions: SignedTransaction<TransactionDetails>[]
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
    signedTransactions
  );
};
