import { Node } from "@xilution/todd-coin-types";
import { ApiSettings } from "../types";
import { commonOpts, serializeMany, serializeOne } from "./serialization-utils";

const collectionName = "node";

const buildBaseUrl = (apiSettings: ApiSettings) =>
  `${apiSettings.apiBaseUrl}/nodes`;

const buildOpts = (apiSettings: ApiSettings) => ({
  ...commonOpts,
  dataLinks: {
    self: (node: Node) => `${apiSettings.apiBaseUrl}/nodes/${node.id}`,
  },
  attributes: ["createdAt", "updatedAt", "baseUrl"],
});

export const serializeNode = (apiSettings: ApiSettings, node: Node) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings);

  return serializeOne(collectionName, opts, baseUrl, node);
};

export const serializeNodes = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number,
  nodes: Node[]
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
    nodes
  );
};
