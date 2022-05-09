import { Participant } from "@xilution/todd-coin-types";
import { ApiSettings } from "../types";
import { commonOpts, serializeMany, serializeOne } from "./serialization-utils";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";

const collectionName = "participant";

const buildBaseUrl = (apiSettings: ApiSettings) =>
  `${apiSettings.apiBaseUrl}/participants`;

const buildOpts = (apiSettings: ApiSettings) => ({
  ...commonOpts,
  dataLinks: {
    self: (participant: Participant) =>
      `${apiSettings.apiBaseUrl}/participants/${participant.id}`,
  },
  attributes: [
    "createdAt",
    "updatedAt",
    "email",
    "firstName",
    "lastName",
    "phone",
    "keys",
    "roles",
    "organizations",
  ],
  typeForAttribute: (attribute: string) => {
    return {
      keys: "participant-key",
      organizations: "organization",
    }[attribute];
  },
  keys: {
    ref: "id",
    relationshipLinks: {
      related: (participant: Participant) =>
        `${apiSettings.apiBaseUrl}/participants/${participant.id}/keys?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`,
    },
  },
  organizations: {
    ref: "id",
    relationshipLinks: {
      related: (participant: Participant) =>
        `${apiSettings.apiBaseUrl}/participants/${participant.id}/organizations?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`,
    },
  },
});

export const serializeParticipant = (
  apiSettings: ApiSettings,
  participant: Participant
) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings);

  return serializeOne(collectionName, opts, baseUrl, participant);
};

export const serializeParticipants = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number,
  participants: Participant[]
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
    participants
  );
};
