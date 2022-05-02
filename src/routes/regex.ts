export const HASH_REGEX = /^([a-z0-9]){64}$/;
export const PUBLIC_KEY_REGEX = /^([a-z0-9]){130}$/;
export const SIGNATURE_REGEX = /^([a-z0-9]){142}$/;
export const PHONE_REGEX = /^\(\d{3}\)\s\d{3}-\d{4}$/;
export const AUTH_HEADER_REGEX =
  /^[Bb]earer [A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;
export const JWT_REGEX = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/;
