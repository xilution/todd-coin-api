import { Block } from "@xilution/todd-coin-types";
import { ApiSettings } from "../types";
import { commonOpts, serializeMany, serializeOne } from "./serialization-utils";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";

const collectionName = "block";

const buildBaseUrl = (apiSettings: ApiSettings) =>
  `${apiSettings.apiBaseUrl}/blocks`;

const buildOpts = (apiSettings: ApiSettings) => ({
  ...commonOpts,
  dataLinks: {
    self: (block: Block) => `${apiSettings.apiBaseUrl}/blocks/${block.id}`,
  },
  attributes: [
    "createdAt",
    "updatedAt",
    "sequenceId",
    "nonce",
    "previousHash",
    "hash",
    "transactions",
  ],
  typeForAttribute: (attribute: string) => {
    return {
      transactions: "transaction",
    }[attribute];
  },
  transactions: {
    ref: "id",
    relationshipLinks: {
      related: (block: Block) =>
        `${apiSettings.apiBaseUrl}/blocks/${block.id}/transactions?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`,
    },
  },
});

export const serializeBlock = (apiSettings: ApiSettings, block: Block) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings);

  return serializeOne(collectionName, opts, baseUrl, block);
};

export const serializeBlocks = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number,
  blocks: Block[]
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
    blocks
  );
};
