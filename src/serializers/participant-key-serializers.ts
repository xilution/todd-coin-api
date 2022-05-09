import { Participant, ParticipantKey } from "@xilution/todd-coin-types";
import { ApiSettings } from "../types";
import { commonOpts, serializeMany, serializeOne } from "./serialization-utils";

const collectionName = "participantKey";

const buildBaseUrl = (apiSettings: ApiSettings, participant: Participant) =>
  `${apiSettings.apiBaseUrl}/participants/${participant.id}/keys`;

const buildOpts = (apiSettings: ApiSettings) => ({
  ...commonOpts,
  dataLinks: {
    self: (participantKey: ParticipantKey) =>
      `${apiSettings.apiBaseUrl}/participants/${participantKey.participant?.id}/keys/${participantKey.id}`,
  },
  attributes: [
    "createdAt",
    "updatedAt",
    "public",
    "private",
    "effective",
    "participant",
  ],
  typeForAttribute: (attribute: string) => {
    return {
      participant: "participant",
    }[attribute];
  },
  participant: {
    ref: "id",
    relationshipLinks: {
      related: (participantKey: ParticipantKey) =>
        `${apiSettings.apiBaseUrl}/participants/${participantKey.id}`,
    },
  },
});

export const serializeParticipantKey = (
  apiSettings: ApiSettings,
  participant: Participant,
  participantKey: ParticipantKey
) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings, participant);

  return serializeOne(collectionName, opts, baseUrl, participantKey);
};

export const serializeParticipantKeys = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number,
  participant: Participant,
  participantKeys: ParticipantKey[]
) => {
  const opts = buildOpts(apiSettings);
  const baseUrl = buildBaseUrl(apiSettings, participant);

  return serializeMany(
    collectionName,
    count,
    pageSize,
    pageNumber,
    opts,
    baseUrl,
    participantKeys
  );
};
