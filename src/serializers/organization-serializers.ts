import { Organization } from "@xilution/todd-coin-types";
import { ApiSettings } from "../types";
import { commonOpts, serializeMany, serializeOne } from "./serialization-utils";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";

const collectionName = "organization";

const buildBaseUrl = (apiSettings: ApiSettings) =>
  `${apiSettings.apiBaseUrl}/organizations`;

const buildOpts = (apiSettings: ApiSettings) => ({
  ...commonOpts,
  dataLinks: {
    self: (organization: Organization) =>
      `${apiSettings.apiBaseUrl}/organizations/${organization.id}`,
  },
  attributes: [
    "createdAt",
    "updatedAt",
    "email",
    "name",
    "phone",
    "url",
    "vision",
    "mission",
    "roles",
    "domains",
    "participants",
    "administrators",
    "authorizedSigners",
  ],
  typeForAttribute: (attribute: string) => {
    return {
      participants: "participant",
      administrators: "participant",
      authorizedSigners: "participant",
    }[attribute];
  },
  participants: {
    ref: "id",
    relationshipLinks: {
      related: (organization: Organization) =>
        `${apiSettings.apiBaseUrl}/organizations/${organization.id}/participants?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`,
    },
  },
  administrators: {
    ref: "id",
    relationshipLinks: {
      related: (organization: Organization) =>
        `${apiSettings.apiBaseUrl}/organizations/${organization.id}/administrators?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`,
    },
  },
  authorizedSigners: {
    ref: "id",
    relationshipLinks: {
      related: (organization: Organization) =>
        `${apiSettings.apiBaseUrl}/organizations/${organization.id}/authorized-signers?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`,
    },
  },
});

export const serializeOrganization = (
  apiSettings: ApiSettings,
  organization: Organization
) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings);

  return serializeOne(collectionName, opts, baseUrl, organization);
};

export const serializeOrganizations = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number,
  organizations: Organization[]
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
    organizations
  );
};
