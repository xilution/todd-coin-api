import { FIRST_PAGE } from "@xilution/todd-coin-constants";
import { Serializer, SerializerOptions } from "jsonapi-serializer";

export const calculateTotalPages = (count: number, pageSize: number) =>
  Math.ceil(count / pageSize);

export const commonProperties = {
  jsonapi: {
    version: "1.0",
  },
};

export const commonOpts = {
  pluralizeType: false,
  keyForAttribute: "camelCase",
};

export const buildPaginationLinks = (
  baseUrl: string,
  pageNumber: number,
  pageSize: number,
  totalPages: number
) => {
  const nextPage = pageNumber + 1;
  const previousPage = pageNumber - 1;

  return {
    first: () => `${baseUrl}?page[number]=${FIRST_PAGE}&page[size]=${pageSize}`,
    last: () => `${baseUrl}?page[number]=${totalPages}&page[size]=${pageSize}`,
    next: () =>
      nextPage <= totalPages
        ? `${baseUrl}?page[number]=${nextPage}&page[size]=${pageSize}`
        : undefined,
    prev: () =>
      previousPage >= 0
        ? `${baseUrl}?page[number]=${previousPage}&page[size]=${pageSize}`
        : undefined,
  };
};

export const serializeMany = <T extends { id?: string }>(
  collectionName: string,
  count: number,
  pageSize: number,
  pageNumber: number,
  opts: SerializerOptions,
  baseUrl: string,
  things: T[]
) => {
  const totalPages = calculateTotalPages(count, pageSize);

  const serializer = new Serializer(collectionName, {
    ...opts,
    topLevelLinks: {
      self: () => baseUrl,
      ...buildPaginationLinks(baseUrl, pageNumber, pageSize, totalPages),
    },
    meta: {
      itemsPerPage: pageSize,
      totalItems: count,
      currentPage: pageNumber,
      totalPages: totalPages,
    },
  });

  return {
    ...commonProperties,
    ...serializer.serialize(things),
  };
};

export const serializeOne = <T extends { id?: string }>(
  collectionName: string,
  opts: SerializerOptions,
  baseUrl: string,
  thing: T
) => {
  const serializer = new Serializer(collectionName, {
    ...opts,
    topLevelLinks: {
      self: (thing: T) => `${baseUrl}/${thing.id}`,
    },
  });

  return {
    ...commonProperties,
    ...serializer.serialize(thing),
  };
};
