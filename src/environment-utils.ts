import { ApiSettings } from "./types";
import { GENESIS_PARTICIPANT_ID } from "@xilution/todd-coin-constants";

const DEFAULT_JWT_SIGNING_SECRET = "all your base are belong to us";
const DEFAULT_API_HOST = "localhost";
const DEFAULT_API_PORT = 3000;
const DEFAULT_API_PROTOCOL = "http";
const DEFAULT_API_BASE_URL = "http://localhost:3000";

export const getApiSettings = (): ApiSettings => {
  const jwtSecretKey =
    process.env.JWT_SIGNING_SECRET || DEFAULT_JWT_SIGNING_SECRET;
  const apiHost = process.env.API_HOST || DEFAULT_API_HOST;
  const apiPort = Number(process.env.API_PORT) || DEFAULT_API_PORT;
  const apiProtocol = process.env.API_PROTOCOL || DEFAULT_API_PROTOCOL;
  const apiBaseUrl = process.env.API_BASE_URL || DEFAULT_API_BASE_URL;
  const hostMaintainerId =
    process.env.HOST_MAINTAINER_ID || GENESIS_PARTICIPANT_ID;

  return {
    jwtSecretKey,
    apiProtocol,
    apiHost,
    apiPort,
    apiBaseUrl,
    hostMaintainerId,
  };
};
