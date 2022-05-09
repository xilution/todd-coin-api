import {
  Block,
  BlockTransaction,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import { ApiSettings } from "../types";
import { commonOpts, serializeMany, serializeOne } from "./serialization-utils";

const collectionName = "block-transaction";

const buildBaseUrl = (apiSettings: ApiSettings, block: Block) =>
  `${apiSettings.apiBaseUrl}/blocks/${block.id}/block-transactions`;

const buildOpts = (apiSettings: ApiSettings) => ({
  ...commonOpts,
  dataLinks: {
    self: (blockTransaction: BlockTransaction<TransactionDetails>) =>
      `${apiSettings.apiBaseUrl}/blocks/${blockTransaction.block?.id}/transactions/${blockTransaction.id}`,
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
    "block",
  ],
  typeForAttribute: (attribute: string) => {
    return {
      fromParticipant: "participant",
      fromOrganization: "organization",
      toParticipant: "participant",
      toOrganization: "organization",
      participantKey: "participant-key",
      block: "block",
    }[attribute];
  },
  fromParticipant: {
    ref: "id",
    relationshipLinks: {
      related: (blockTransaction: BlockTransaction<TransactionDetails>) =>
        blockTransaction.fromParticipant
          ? `${apiSettings.apiBaseUrl}/participants/${blockTransaction.fromParticipant.id}`
          : undefined,
    },
  },
  fromOrganization: {
    ref: "id",
    relationshipLinks: {
      related: (blockTransaction: BlockTransaction<TransactionDetails>) =>
        blockTransaction.fromOrganization
          ? `${apiSettings.apiBaseUrl}/organizations/${blockTransaction.fromOrganization.id}`
          : undefined,
    },
  },
  toParticipant: {
    ref: "id",
    relationshipLinks: {
      related: (blockTransaction: BlockTransaction<TransactionDetails>) =>
        blockTransaction.toParticipant
          ? `${apiSettings.apiBaseUrl}/participants/${blockTransaction.toParticipant.id}`
          : undefined,
    },
  },
  toOrganization: {
    ref: "id",
    relationshipLinks: {
      related: (blockTransaction: BlockTransaction<TransactionDetails>) =>
        blockTransaction.toOrganization
          ? `${apiSettings.apiBaseUrl}/organizations/${blockTransaction.toOrganization.id}`
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
  block: {
    ref: "id",
    relationshipLinks: {
      related: (blockTransaction: BlockTransaction<TransactionDetails>) =>
        blockTransaction.block
          ? `${apiSettings.apiBaseUrl}/blocks/${blockTransaction.block?.id}`
          : undefined,
    },
  },
});

export const serializeBlockTransaction = (
  apiSettings: ApiSettings,
  block: Block,
  blockTransaction: BlockTransaction<TransactionDetails>
) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings, block);

  return serializeOne(collectionName, opts, baseUrl, blockTransaction);
};

export const serializeBlockTransactions = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number,
  block: Block,
  blockTransactions: BlockTransaction<TransactionDetails>[]
) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings, block);

  return serializeMany(
    collectionName,
    count,
    pageSize,
    pageNumber,
    opts,
    baseUrl,
    blockTransactions
  );
};
