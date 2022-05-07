import Joi from "joi";
import {
  OrganizationRoles,
  ParticipantRoles,
  TransactionType,
  TransactionTypes,
} from "@xilution/todd-coin-types";
import {
  MAX_TRANSACTIONS_PER_BLOCK,
  MAXIMUM_PAGE_SIZE,
} from "@xilution/todd-coin-constants";
import {
  ACCESS_TOKEN_DESCRIPTION,
  ACCESS_TOKEN_LABEL,
  ACCURACY_LABEL,
  ALTITUDE_ACCURACY_LABEL,
  ALTITUDE_LABEL,
  AMOUNT_LABEL,
  AUTHENTICATION_HEADER_DESCRIPTION,
  AUTHORIZATION_LABEL,
  BASE_URL_LABEL,
  BLOCK_ATTRIBUTES_LABEL,
  BLOCK_DATA_LABEL,
  BLOCK_RELATIONSHIPS_LABEL,
  BLOCK_TRANSACTION_ATTRIBUTES_LABEL,
  BLOCK_TRANSACTION_DATA_LABEL,
  BLOCK_TRANSACTION_LABEL,
  BLOCK_TRANSACTION_RELATIONSHIPS_LABEL,
  BLOCK_TRANSACTIONS_LABEL,
  BLOCK_TRANSACTIONS_RELATIONSHIPS_LABEL,
  COORDINATES_LABEL,
  CREATED_AT_LABEL,
  CURRENCY_LABEL,
  CURRENT_PAGE_DESCRIPTION,
  DATE_RANGES_LABEL,
  DESCRIPTION_LABEL,
  EFFECTIVE_DATE_RANGE_LABEL,
  EMAIL_LABEL,
  EPOCH_TIMESTAMP_LABEL,
  FIRST_NAME_LABEL,
  FIRST_PAGE_LINK_DESCRIPTION,
  FIRST_PAGE_LINK_LABEL,
  FROM_DATE_LABEL,
  FROM_PARTICIPANT_ID_LABEL,
  FROM_PARTICIPANT_LABEL,
  GEO_LOCATION_POSITION_LABEL,
  GEO_LOCATION_POSITIONS_LABEL,
  GOOD_POINTS_LABEL,
  HASH_LABEL,
  HEADING_LABEL,
  ID_LABEL,
  ISO_8601_FORMAT_DESCRIPTION,
  ITEMS_PER_PAGE_DESCRIPTION,
  JSON_API_LABEL,
  LAST_NAME_LABEL,
  LAST_PAGE_LINK_DESCRIPTION,
  LAST_PAGE_LINK_LABEL,
  LATITUDE_LABEL,
  LONGITUDE_LABEL,
  META_DATA_LABEL,
  META_LABEL,
  NEXT_PAGE_LINK_DESCRIPTION,
  NEXT_PAGE_LINK_LABEL,
  NODE_ATTRIBUTES_LABEL,
  NODE_DATA_LABEL,
  NONCE_LABEL,
  ORGANIZATION_ATTRIBUTES_LABEL,
  ORGANIZATION_DATA_LABEL,
  ORGANIZATION_NAME_LABEL,
  ORGANIZATION_PARTICIPANTS_REF_DATA_LABEL,
  ORGANIZATION_ROLE_TYPES_LABEL,
  ORGANIZATIONS_LABEL,
  PAGE_NUMBER_DESCRIPTION,
  PAGE_NUMBER_LABEL,
  PAGE_SIZE_DESCRIPTION,
  PAGE_SIZE_LABEL,
  PARTICIPANT_ATTRIBUTES_LABEL,
  PARTICIPANT_DATA_LABEL,
  PARTICIPANT_KEY_ATTRIBUTES_LABEL,
  PARTICIPANT_KEY_DATA_LABEL,
  PARTICIPANT_PASSWORD_DESCRIPTION,
  PARTICIPANT_ROLE_TYPES_LABEL,
  PARTICIPANTS_LABEL,
  PASSWORD_LABEL,
  PENDING_TRANSACTION_ATTRIBUTES_LABEL,
  PENDING_TRANSACTION_DATA_LABEL,
  PENDING_TRANSACTIONS_RELATIONSHIPS_LABEL,
  PHONE_NUMBER_LABEL,
  PREVIOUS_HASH_LABEL,
  PREVIOUS_PAGE_LINK_DESCRIPTION,
  PREVIOUS_PAGE_LINK_LABEL,
  PRIVATE_KEY_LABEL,
  PUBLIC_KEY_LABEL,
  ROLES_LABEL,
  SELF_PAGE_LABEL,
  SELF_PAGE_LINK_DESCRIPTION,
  SEQUENCE_ID_LABEL,
  SIGNATURE_LABEL,
  SIGNED_TRANSACTION_ATTRIBUTES_LABEL,
  SIGNED_TRANSACTION_DATA_LABEL,
  SIGNED_TRANSACTIONS_RELATIONSHIPS_LABEL,
  SPEED_LABEL,
  TIME_TRANSACTIONS_DETAILS_LABEL,
  TO_DATE_LABEL,
  TO_PARTICIPANT_ID_LABEL,
  TO_PARTICIPANT_LABEL,
  TOTAL_ITEMS_DESCRIPTION,
  TOTAL_NUMBER_OF_PAGES_DESCRIPTION,
  TRANSACTION_DETAILS_LABEL,
  TRANSACTION_LABEL,
  TRANSACTION_META_DATA_LINK_LABEL,
  TRANSACTION_META_DATA_LINKS_LABEL,
  TRANSACTION_TYPE_LABEL,
  TREASURE_TRANSACTION_DETAILS_LABEL,
  TYPE_LABEL,
  UPDATED_AT_LABEL,
  URI_LABEL,
} from "./messages";
import {
  AUTH_HEADER_REGEX,
  HASH_REGEX,
  JWT_REGEX,
  PHONE_REGEX,
  PRIVATE_KEY_REGEX,
  PUBLIC_KEY_REGEX,
  SIGNATURE_REGEX,
} from "./regex";
import {
  DATE_RANGES_MAX,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  GEO_LOCATION_POSITIONS_MAX,
  JSON_API_VERSION,
  LINKS_MAX,
  ORGANIZATION_NAME_MAX,
  ORGANIZATION_NAME_MIN,
  ORGANIZATION_PARTICIPANTS_MAX,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from "./constants";

export const JSON_API_SCHEMA = Joi.object({
  version: Joi.string().valid(JSON_API_VERSION),
}).label(JSON_API_LABEL);

export const GET_MANY_META_SCHEMA = Joi.object({
  itemsPerPage: Joi.number()
    .example(10)
    .description(ITEMS_PER_PAGE_DESCRIPTION),
  totalItems: Joi.number().example(2).description(TOTAL_ITEMS_DESCRIPTION),
  currentPage: Joi.number().example(0).description(CURRENT_PAGE_DESCRIPTION),
  totalPages: Joi.number()
    .example(1)
    .description(TOTAL_NUMBER_OF_PAGES_DESCRIPTION),
}).label(META_LABEL);

export const buildReturnManyLinks = (exampleBaseUrl: string) =>
  Joi.object({
    self: Joi.string()
      .uri()
      .example(`${exampleBaseUrl}?page[number]=0&page[size]=10`)
      .description(SELF_PAGE_LINK_DESCRIPTION)
      .label(SELF_PAGE_LABEL),
    first: Joi.string()
      .uri()
      .example(`${exampleBaseUrl}?page[number]=0&page[size]=10`)
      .description(FIRST_PAGE_LINK_DESCRIPTION)
      .label(FIRST_PAGE_LINK_LABEL),
    last: Joi.string()
      .uri()
      .example(`${exampleBaseUrl}?page[number]=1&page[size]=10`)
      .description(LAST_PAGE_LINK_DESCRIPTION)
      .label(LAST_PAGE_LINK_LABEL),
    prev: Joi.string()
      .uri()
      .example(null)
      .description(PREVIOUS_PAGE_LINK_DESCRIPTION)
      .label(PREVIOUS_PAGE_LINK_LABEL),
    next: Joi.string()
      .uri()
      .example(`${exampleBaseUrl}?page[number]=1&page[size]=10`)
      .description(NEXT_PAGE_LINK_DESCRIPTION)
      .label(NEXT_PAGE_LINK_LABEL),
  });

export const buildReturnOneLinks = (example: string) =>
  Joi.object({
    self: Joi.string().uri().example(example),
  });

export const ACCESS_TOKEN_SCHEMA = Joi.string()
  .regex(JWT_REGEX)
  .example(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  )
  .description(ACCESS_TOKEN_DESCRIPTION)
  .label(ACCESS_TOKEN_LABEL);

export const AUTHORIZATION_SCHEMA = Joi.string()
  .regex(AUTH_HEADER_REGEX)
  .example(
    "bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
  )
  .description(AUTHENTICATION_HEADER_DESCRIPTION)
  .label(AUTHORIZATION_LABEL);

export const PUBLIC_KEY_SCHEMA = Joi.string()
  .regex(PUBLIC_KEY_REGEX)
  .label(PUBLIC_KEY_LABEL);

export const PRIVATE_KEY_SCHEMA = Joi.string()
  .regex(PRIVATE_KEY_REGEX)
  .label(PRIVATE_KEY_LABEL);

export const ID_SCHEMA = Joi.string()
  .guid()
  .example("9e1e3b0f-661d-4d45-9a29-3e53fa5453ec");

export const CREATED_AT_SCHEMA = Joi.date()
  .iso()
  .description(ISO_8601_FORMAT_DESCRIPTION)
  .example("2022-05-01T15:52:52.395Z")
  .label(CREATED_AT_LABEL);

export const UPDATED_AT_SCHEMA = Joi.date()
  .iso()
  .description(ISO_8601_FORMAT_DESCRIPTION)
  .example("2022-05-01T15:52:52.395Z")
  .label(UPDATED_AT_LABEL);

export const GOOD_POINTS_SCHEMA = Joi.number()
  .integer()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER)
  .example(25)
  .label(GOOD_POINTS_LABEL);

export const SIGNATURE_SCHEMA = Joi.string()
  .pattern(SIGNATURE_REGEX)
  .label(SIGNATURE_LABEL);

export const EFFECTIVE_DATE_RANGE_SCHEMA = Joi.object({
  from: Joi.date()
    .iso()
    .description(ISO_8601_FORMAT_DESCRIPTION)
    .example("2022-05-01T15:52:52.395Z")
    .label(FROM_DATE_LABEL)
    .required(),
  to: Joi.date()
    .iso()
    .min(Joi.ref("from"))
    .description(ISO_8601_FORMAT_DESCRIPTION)
    .example("2022-05-03T15:52:52.395Z")
    .label(TO_DATE_LABEL)
    .required(),
}).label(EFFECTIVE_DATE_RANGE_LABEL);

// todo - add more constraints to geo location position input validation
export const GEO_LOCATION_POSITION_SCHEMA = Joi.object({
  coords: Joi.object({
    accuracy: Joi.number().required().label(ACCURACY_LABEL),
    altitude: Joi.number().label(ALTITUDE_LABEL),
    altitudeAccuracy: Joi.number().label(ALTITUDE_ACCURACY_LABEL),
    heading: Joi.number().label(HEADING_LABEL),
    latitude: Joi.number().required().label(LATITUDE_LABEL),
    longitude: Joi.number().required().label(LONGITUDE_LABEL),
    speed: Joi.number().label(SPEED_LABEL),
  })
    .required()
    .label(COORDINATES_LABEL),
  timestamp: Joi.number().required().label(EPOCH_TIMESTAMP_LABEL),
}).label(GEO_LOCATION_POSITION_LABEL);

export const DESCRIPTION_SCHEMA = Joi.string()
  .min(DESCRIPTION_MIN)
  .max(DESCRIPTION_MAX)
  .example("The quick red fox jumped over the lazy brown dog.")
  .label(DESCRIPTION_LABEL);

export const TO_PARTICIPANT_ID_SCHEMA = Joi.string()
  .guid()
  .example("47fa9749-b45a-402f-9afb-8cc84b9ff837")
  .label(TO_PARTICIPANT_ID_LABEL)
  .required();

export const FROM_PARTICIPANT_ID_SCHEMA = Joi.string()
  .guid()
  .example("f9733dd7-76ad-404d-89f6-9f1f2054440a")
  .label(FROM_PARTICIPANT_ID_LABEL)
  .required();

export const PAGE_NUMBER_SCHEMA = Joi.number()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER)
  .description(PAGE_NUMBER_DESCRIPTION)
  .label(PAGE_NUMBER_LABEL);

export const PAGE_SIZE_SCHEMA = Joi.number()
  .min(1)
  .max(MAXIMUM_PAGE_SIZE)
  .description(PAGE_SIZE_DESCRIPTION)
  .label(PAGE_SIZE_LABEL);

export const NONCE_SCHEMA = Joi.number()
  .integer()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER)
  .example(12345)
  .label(NONCE_LABEL);

export const SEQUENCE_ID_SCHEMA = Joi.number()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER)
  .example(123)
  .label(SEQUENCE_ID_LABEL);

export const EMAIL_SCHEMA = Joi.string()
  .email()
  .example("jdoe@example.com")
  .label(EMAIL_LABEL);

export const PASSWORD_SCHEMA = Joi.string()
  .min(PASSWORD_MIN)
  .max(PASSWORD_MAX)
  .example("secret")
  .description(PARTICIPANT_PASSWORD_DESCRIPTION)
  .label(PASSWORD_LABEL);

export const FIRST_NAME_SCHEMA = Joi.string()
  .min(3)
  .max(100)
  .example("John")
  .label(FIRST_NAME_LABEL);

export const LAST_NAME_SCHEMA = Joi.string()
  .min(3)
  .max(100)
  .example("Doe")
  .label(LAST_NAME_LABEL);

export const PHONE_NUMBER_SCHEMA = Joi.string()
  .pattern(PHONE_REGEX)
  .example("555-555-5555")
  .label(PHONE_NUMBER_LABEL);

export const ORGANIZATION_NAME_SCHEMA = Joi.string()
  .min(ORGANIZATION_NAME_MIN)
  .max(ORGANIZATION_NAME_MAX)
  .example("ACME, Inc.")
  .label(ORGANIZATION_NAME_LABEL);

export const PREVIOUS_HASH_SCHEMA = Joi.string()
  .pattern(HASH_REGEX)
  .label(PREVIOUS_HASH_LABEL);

export const HASH_SCHEMA = Joi.string().pattern(HASH_REGEX).label(HASH_LABEL);

export const BASE_URL_SCHEMA = Joi.string()
  .uri()
  .example("http://example.com/todd-coin")
  .label(BASE_URL_LABEL);

export const READ_PARTICIPANT_SCHEMA = Joi.object({
  type: Joi.string().allow("participant").label(TYPE_LABEL),
  id: ID_SCHEMA,
  attributes: Joi.object({
    createdAt: CREATED_AT_SCHEMA,
    updatedAt: UPDATED_AT_SCHEMA,
    email: EMAIL_SCHEMA,
    firstName: FIRST_NAME_SCHEMA,
    lastName: LAST_NAME_SCHEMA,
    phone: PHONE_NUMBER_SCHEMA,
    roles: Joi.array()
      .items(
        Joi.string()
          .allow(...ParticipantRoles)
          .label(PARTICIPANT_ROLE_TYPES_LABEL)
      )
      .min(1)
      .label(ROLES_LABEL),
  }).label(PARTICIPANT_ATTRIBUTES_LABEL),
}).label(PARTICIPANT_DATA_LABEL);

export const CREATE_PARTICIPANT_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL),
  type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    email: EMAIL_SCHEMA.required(),
    password: PASSWORD_SCHEMA,
    firstName: FIRST_NAME_SCHEMA,
    lastName: LAST_NAME_SCHEMA,
    phone: PHONE_NUMBER_SCHEMA,
    roles: Joi.array()
      .items(
        Joi.string()
          .allow(...ParticipantRoles)
          .label(PARTICIPANT_ROLE_TYPES_LABEL)
      )
      .min(1)
      .label(ROLES_LABEL)
      .required(),
  })
    .unknown(false)
    .label(PARTICIPANT_ATTRIBUTES_LABEL)
    .required(),
})
  .unknown(false)
  .label(PARTICIPANT_DATA_LABEL)
  .required();

export const UPDATE_PARTICIPANT_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL).required(),
  type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    email: EMAIL_SCHEMA,
    password: PASSWORD_SCHEMA,
    firstName: FIRST_NAME_SCHEMA,
    lastName: LAST_NAME_SCHEMA,
    phone: PHONE_NUMBER_SCHEMA,
    roles: Joi.array()
      .items(
        Joi.string()
          .allow(...ParticipantRoles)
          .label(PARTICIPANT_ROLE_TYPES_LABEL)
      )
      .min(1)
      .label(ROLES_LABEL),
  })
    .unknown(false)
    .label(PARTICIPANT_ATTRIBUTES_LABEL)
    .required(),
})
  .unknown(false)
  .label(PARTICIPANT_DATA_LABEL)
  .required();

export const READ_PARTICIPANT_KEY_SCHEMA = Joi.object({
  type: Joi.string().allow("participant-key").label(TYPE_LABEL),
  id: ID_SCHEMA,
  attributes: Joi.object({
    createdAt: CREATED_AT_SCHEMA,
    updatedAt: UPDATED_AT_SCHEMA,
    public: PUBLIC_KEY_SCHEMA,
    effective: EFFECTIVE_DATE_RANGE_SCHEMA,
  }).label(PARTICIPANT_KEY_ATTRIBUTES_LABEL),
}).label(PARTICIPANT_KEY_DATA_LABEL);

export const CREATE_PARTICIPANT_KEY_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL),
  type: Joi.string().allow("participant-key").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    public: PUBLIC_KEY_SCHEMA.required(),
    private: PRIVATE_KEY_SCHEMA.required(),
    effective: EFFECTIVE_DATE_RANGE_SCHEMA.required(),
  })
    .label(PARTICIPANT_KEY_ATTRIBUTES_LABEL)
    .required(),
})
  .unknown(false)
  .label(PARTICIPANT_KEY_DATA_LABEL)
  .required();

export const UPDATE_PARTICIPANT_KEY_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL).required(),
  type: Joi.string().allow("participant-key").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    effective: EFFECTIVE_DATE_RANGE_SCHEMA.required(),
  })
    .label(PARTICIPANT_KEY_ATTRIBUTES_LABEL)
    .required(),
})
  .unknown(false)
  .label(PARTICIPANT_KEY_DATA_LABEL)
  .required();

export const READ_NODE_SCHEMA = Joi.object({
  type: Joi.string().allow("node").label(TYPE_LABEL),
  attributes: Joi.object({
    createdAt: CREATED_AT_SCHEMA,
    updatedAt: UPDATED_AT_SCHEMA,
    baseUrl: BASE_URL_SCHEMA,
  }).label(NODE_ATTRIBUTES_LABEL),
}).label(NODE_DATA_LABEL);

export const CREATE_NODE_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL),
  type: Joi.string().allow("node").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    baseUrl: BASE_URL_SCHEMA.required(),
  })
    .unknown(false)
    .label(NODE_ATTRIBUTES_LABEL)
    .required(),
})
  .unknown(false)
  .label(NODE_DATA_LABEL)
  .required();

export const UPDATE_NODE_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL).required(),
  type: Joi.string().allow("node").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    baseUrl: BASE_URL_SCHEMA,
  })
    .unknown(false)
    .label(NODE_ATTRIBUTES_LABEL)
    .required(),
})
  .unknown(false)
  .label(NODE_DATA_LABEL)
  .required();

export const READ_ORGANIZATION_SCHEMA = Joi.object({
  type: Joi.string().allow("organization").label(TYPE_LABEL),
  id: ID_SCHEMA,
  attributes: Joi.object({
    createdAt: CREATED_AT_SCHEMA,
    updatedAt: UPDATED_AT_SCHEMA,
    email: EMAIL_SCHEMA,
    name: ORGANIZATION_NAME_SCHEMA,
    phone: PHONE_NUMBER_SCHEMA,
    roles: Joi.array()
      .items(
        Joi.string()
          .allow(...OrganizationRoles)
          .label(ORGANIZATION_ROLE_TYPES_LABEL)
      )
      .min(1)
      .label(ROLES_LABEL),
  }).label(ORGANIZATION_ATTRIBUTES_LABEL),
}).label(ORGANIZATION_DATA_LABEL);

export const CREATE_ORGANIZATION_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL),
  type: Joi.string().allow("organization").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    email: EMAIL_SCHEMA,
    name: ORGANIZATION_NAME_SCHEMA.required(),
    phone: PHONE_NUMBER_SCHEMA,
    roles: Joi.array()
      .items(
        Joi.string()
          .allow(...OrganizationRoles)
          .label(ORGANIZATION_ROLE_TYPES_LABEL)
      )
      .min(1)
      .label(ROLES_LABEL)
      .required(),
  })
    .unknown(false)
    .label(ORGANIZATION_ATTRIBUTES_LABEL)
    .required(),
})
  .unknown(false)
  .label(ORGANIZATION_DATA_LABEL)
  .required();

export const UPDATE_ORGANIZATION_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL).required(),
  type: Joi.string().allow("organization").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    email: EMAIL_SCHEMA,
    name: ORGANIZATION_NAME_SCHEMA,
    phone: PHONE_NUMBER_SCHEMA,
    roles: Joi.array()
      .items(
        Joi.string()
          .allow(...OrganizationRoles)
          .label(ORGANIZATION_ROLE_TYPES_LABEL)
      )
      .min(1)
      .label(ROLES_LABEL),
  })
    .unknown(false)
    .label(ORGANIZATION_ATTRIBUTES_LABEL)
    .required(),
})
  .unknown(false)
  .label(ORGANIZATION_DATA_LABEL)
  .required();

export const CREATE_ORGANIZATION_PARTICIPANT_REFERENCE_SCHEMA = Joi.array()
  .items(
    Joi.object({
      id: ID_SCHEMA,
      type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
    }).label(PARTICIPANTS_LABEL)
  )
  .min(1)
  .max(ORGANIZATION_PARTICIPANTS_MAX)
  .label(ORGANIZATION_PARTICIPANTS_REF_DATA_LABEL)
  .required();

export const CREATE_PARTICIPANT_ORGANIZATION_REFERENCE_SCHEMA = Joi.array()
  .items(
    Joi.object({
      id: ID_SCHEMA,
      type: Joi.string().allow("organization").label(TYPE_LABEL).required(),
    }).label(ORGANIZATIONS_LABEL)
  )
  .min(1)
  .max(ORGANIZATION_PARTICIPANTS_MAX)
  .label(ORGANIZATION_PARTICIPANTS_REF_DATA_LABEL)
  .required();

export const TRANSACTION_TYPE_SCHEMA = Joi.string()
  .allow(...TransactionTypes)
  .label(TRANSACTION_TYPE_LABEL);

export const TRANSACTION_META_DATA_LINK_URI_SCHEMA = Joi.string()
  .uri()
  .example("http://example.com/foo")
  .label(URI_LABEL);

export const TRANSACTION_META_DATA_LINK_SCHEMA = Joi.object({
  description: DESCRIPTION_SCHEMA,
  uri: TRANSACTION_META_DATA_LINK_URI_SCHEMA.required(),
}).label(TRANSACTION_META_DATA_LINK_LABEL);

export const TRANSACTION_META_DATA_LINKS_SCHEMA = Joi.array()
  .items(TRANSACTION_META_DATA_LINK_SCHEMA)
  .min(0)
  .max(LINKS_MAX)
  .label(TRANSACTION_META_DATA_LINKS_LABEL);

export const TRANSACTION_META_DATA_GEO_LOCATION_POSITIONS_SCHEMA = Joi.array()
  .items(GEO_LOCATION_POSITION_SCHEMA)
  .min(0)
  .max(GEO_LOCATION_POSITIONS_MAX)
  .label(GEO_LOCATION_POSITIONS_LABEL);

export const TRANSACTION_META_DATA_SCHEMA = Joi.object({
  description: DESCRIPTION_SCHEMA,
  geoLocationPositions: TRANSACTION_META_DATA_GEO_LOCATION_POSITIONS_SCHEMA,
  links: TRANSACTION_META_DATA_LINKS_SCHEMA,
}).label(META_DATA_LABEL);

export const DATE_RANGES_SCHEMA = Joi.array()
  .min(1)
  .max(DATE_RANGES_MAX)
  .items(EFFECTIVE_DATE_RANGE_SCHEMA)
  .label(DATE_RANGES_LABEL);

export const TIME_TRANSACTION_DETAILS_SCHEMA = Joi.object({
  dateRanges: DATE_RANGES_SCHEMA.required(),
  metaData: TRANSACTION_META_DATA_SCHEMA,
}).label(TIME_TRANSACTIONS_DETAILS_LABEL);

export const CURRENCY_SCHEMA = Joi.string()
  .allow(
    "USD",
    "CAD",
    "EUR",
    "BTC",
    "AED",
    "AFN",
    "ALL",
    "AMD",
    "ARS",
    "AUD",
    "AZN",
    "BAM",
    "BDT",
    "BGN",
    "BHD",
    "BIF",
    "BND",
    "BOB",
    "BRL",
    "BWP",
    "BYR",
    "BZD",
    "CDF",
    "CHF",
    "CLP",
    "CNY",
    "COP",
    "CRC",
    "CVE",
    "CZK",
    "DJF",
    "DKK",
    "DOP",
    "DZD",
    "EEK",
    "EGP",
    "ERN",
    "ETB",
    "GBP",
    "GEL",
    "GHS",
    "GNF",
    "GTQ",
    "HKD",
    "HNL",
    "HRK",
    "HUF",
    "IDR",
    "ILS",
    "INR",
    "IQD",
    "IRR",
    "ISK",
    "JMD",
    "JOD",
    "JPY",
    "KES",
    "KHR",
    "KMF",
    "KRW",
    "KWD",
    "KZT",
    "LAK",
    "LBP",
    "LKR",
    "LTL",
    "LVL",
    "LYD",
    "MAD",
    "MDL",
    "MGA",
    "MKD",
    "MMK",
    "MOP",
    "MUR",
    "MXN",
    "MYR",
    "MZN",
    "NAD",
    "NGN",
    "NIO",
    "NOK",
    "NPR",
    "NZD",
    "OMR",
    "PAB",
    "PEN",
    "PHP",
    "PKR",
    "PLN",
    "PYG",
    "QAR",
    "RON",
    "RSD",
    "RUB",
    "RWF",
    "SAR",
    "SDG",
    "SEK",
    "SGD",
    "SOS",
    "SYP",
    "THB",
    "TND",
    "TOP",
    "TRY",
    "TTD",
    "TWD",
    "TZS",
    "UAH",
    "UGX",
    "UYU",
    "UZS",
    "VEF",
    "VND",
    "XAF",
    "XOF",
    "YER",
    "ZAR",
    "ZMK"
  )
  .label(CURRENCY_LABEL);

export const AMOUNT_SCHEMA = Joi.number()
  .integer()
  .min(0)
  .max(Number.MAX_SAFE_INTEGER)
  .example(2500) // todo - describe this in integer denominations (no decimals)
  .label(AMOUNT_LABEL);

export const TREASURE_TRANSACTION_DETAILS_SCHEMA = Joi.object({
  amount: AMOUNT_SCHEMA.required(),
  currency: CURRENCY_SCHEMA.required(),
  metaData: TRANSACTION_META_DATA_SCHEMA,
}).label(TREASURE_TRANSACTION_DETAILS_LABEL);

export const TRANSACTION_DETAILS_SCHEMA = Joi.alt()
  .conditional("type", {
    is: TransactionType.TREASURE,
    then: TREASURE_TRANSACTION_DETAILS_SCHEMA,
  })
  .conditional("type", {
    is: TransactionType.TIME,
    then: TIME_TRANSACTION_DETAILS_SCHEMA,
  })
  .label(TRANSACTION_DETAILS_LABEL);

export const BASE_TRANSACTION_SCHEMA = Joi.object({
  type: TRANSACTION_TYPE_SCHEMA.required(),
  details: TRANSACTION_DETAILS_SCHEMA.required(),
  description: DESCRIPTION_SCHEMA,
}).label(TRANSACTION_LABEL);

export const PAGINATION_QUERY_SCHEMA = Joi.object({
  "page[number]": PAGE_NUMBER_SCHEMA,
  "page[size]": PAGE_SIZE_SCHEMA,
});

export const READ_BLOCK_TRANSACTION_SCHEMA = Joi.object({
  type: Joi.string().allow("transaction").label(TYPE_LABEL),
  id: ID_SCHEMA,
  attributes: BASE_TRANSACTION_SCHEMA.keys({
    createdAt: CREATED_AT_SCHEMA,
    updatedAt: UPDATED_AT_SCHEMA,
    goodPoints: GOOD_POINTS_SCHEMA,
    signature: SIGNATURE_SCHEMA,
  }).label(BLOCK_TRANSACTION_ATTRIBUTES_LABEL),
}).label(BLOCK_TRANSACTION_DATA_LABEL);

export const CREATE_BLOCK_TRANSACTION_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL).required(),
  type: Joi.string().allow("transaction").label(TYPE_LABEL).required(),
  attributes: BASE_TRANSACTION_SCHEMA.keys({
    goodPoints: GOOD_POINTS_SCHEMA.required(),
    signature: SIGNATURE_SCHEMA.required(),
  })
    .unknown(false)
    .label(BLOCK_TRANSACTION_ATTRIBUTES_LABEL)
    .required(),
  relationships: Joi.object({
    from: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(FROM_PARTICIPANT_LABEL)
      .required(),
    to: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(TO_PARTICIPANT_LABEL)
      .required(),
  })
    .label(BLOCK_TRANSACTIONS_RELATIONSHIPS_LABEL)
    .required(),
})
  .unknown(false)
  .label(BLOCK_TRANSACTION_DATA_LABEL)
  .required();

export const READ_PENDING_TRANSACTION_SCHEMA = Joi.object({
  type: Joi.string().allow("pending-transaction").label(TYPE_LABEL),
  id: ID_SCHEMA,
  attributes: BASE_TRANSACTION_SCHEMA.keys({
    createdAt: CREATED_AT_SCHEMA,
    updatedAt: UPDATED_AT_SCHEMA,
  }).label(PENDING_TRANSACTION_ATTRIBUTES_LABEL),
  relationships: Joi.object({
    from: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL),
        id: ID_SCHEMA.label(ID_LABEL),
      }).label(PENDING_TRANSACTION_DATA_LABEL),
    }).label(FROM_PARTICIPANT_LABEL),
    to: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL),
        id: ID_SCHEMA.label(ID_LABEL),
      }).label(PENDING_TRANSACTION_DATA_LABEL),
    }).label(TO_PARTICIPANT_LABEL),
  }).label(PENDING_TRANSACTIONS_RELATIONSHIPS_LABEL),
}).label(PENDING_TRANSACTION_DATA_LABEL);

export const CREATE_PENDING_TRANSACTION_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL),
  type: Joi.string().allow("pending-transaction").label(TYPE_LABEL).required(),
  attributes: BASE_TRANSACTION_SCHEMA.unknown(false)
    .label(PENDING_TRANSACTION_ATTRIBUTES_LABEL)
    .required(),
  relationships: Joi.object({
    from: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(FROM_PARTICIPANT_LABEL)
      .required(),
    to: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(TO_PARTICIPANT_LABEL)
      .required(),
  })
    .label(PENDING_TRANSACTIONS_RELATIONSHIPS_LABEL)
    .required(),
})
  .unknown(false)
  .label(PENDING_TRANSACTION_DATA_LABEL)
  .required();

export const UPDATE_PENDING_TRANSACTION_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL).required(),
  type: Joi.string().allow("pending-transaction").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    type: TRANSACTION_TYPE_SCHEMA,
    details: TRANSACTION_DETAILS_SCHEMA,
    description: DESCRIPTION_SCHEMA,
  })
    .unknown(false)
    .label(PENDING_TRANSACTION_ATTRIBUTES_LABEL)
    .required(),
  relationships: Joi.object({
    from: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(FROM_PARTICIPANT_LABEL)
      .required(),
    to: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(TO_PARTICIPANT_LABEL)
      .required(),
  })
    .label(PENDING_TRANSACTIONS_RELATIONSHIPS_LABEL)
    .required(),
})
  .unknown(false)
  .label(PENDING_TRANSACTION_DATA_LABEL)
  .required();

export const READ_SIGNED_TRANSACTION_SCHEMA = Joi.object({
  type: Joi.string().allow("signed-transaction").label(TYPE_LABEL),
  id: ID_SCHEMA,
  attributes: BASE_TRANSACTION_SCHEMA.keys({
    createdAt: CREATED_AT_SCHEMA,
    updatedAt: UPDATED_AT_SCHEMA,
    goodPoints: GOOD_POINTS_SCHEMA,
    signature: SIGNATURE_SCHEMA,
  }).label(SIGNED_TRANSACTION_ATTRIBUTES_LABEL),
  relationships: Joi.object({
    from: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL),
        id: ID_SCHEMA.label(ID_LABEL),
      }).label(PENDING_TRANSACTION_DATA_LABEL),
    }).label(FROM_PARTICIPANT_LABEL),
    to: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL),
        id: ID_SCHEMA.label(ID_LABEL),
      }).label(PENDING_TRANSACTION_DATA_LABEL),
    }).label(TO_PARTICIPANT_LABEL),
  }).label(SIGNED_TRANSACTIONS_RELATIONSHIPS_LABEL),
}).label(SIGNED_TRANSACTION_DATA_LABEL);

export const CREATE_SIGNED_TRANSACTION_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL),
  type: Joi.string().allow("signed-transaction").label(TYPE_LABEL).required(),
  attributes: BASE_TRANSACTION_SCHEMA.keys({
    goodPoints: GOOD_POINTS_SCHEMA.required(),
    signature: SIGNATURE_SCHEMA.required(),
  })
    .unknown(false)
    .label(SIGNED_TRANSACTION_ATTRIBUTES_LABEL)
    .required(),
  relationships: Joi.object({
    from: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(FROM_PARTICIPANT_LABEL)
      .required(),
    to: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(TO_PARTICIPANT_LABEL)
      .required(),
  })
    .label(SIGNED_TRANSACTIONS_RELATIONSHIPS_LABEL)
    .required(),
})
  .unknown(false)
  .label(SIGNED_TRANSACTION_DATA_LABEL)
  .required();

export const UPDATE_SIGNED_TRANSACTION_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL).required(),
  type: Joi.string().allow("signed-transaction").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    description: DESCRIPTION_SCHEMA,
    details: TRANSACTION_DETAILS_SCHEMA,
    goodPoints: GOOD_POINTS_SCHEMA,
    signature: SIGNATURE_SCHEMA,
  })
    .unknown(false)
    .label(SIGNED_TRANSACTION_ATTRIBUTES_LABEL)
    .required(),
  relationships: Joi.object({
    from: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(FROM_PARTICIPANT_LABEL)
      .required(),
    to: Joi.object({
      data: Joi.object({
        type: Joi.string().allow("participant").label(TYPE_LABEL).required(),
        id: ID_SCHEMA.label(ID_LABEL).required(),
      })
        .label(PENDING_TRANSACTION_DATA_LABEL)
        .required(),
    })
      .label(TO_PARTICIPANT_LABEL)
      .required(),
  })
    .label(SIGNED_TRANSACTIONS_RELATIONSHIPS_LABEL)
    .required(),
})
  .unknown(false)
  .label(SIGNED_TRANSACTION_DATA_LABEL)
  .required();

export const READ_BLOCK_SCHEMA = Joi.object({
  type: Joi.string().allow("block").label(TYPE_LABEL),
  id: ID_SCHEMA,
  attributes: Joi.object({
    createdAt: CREATED_AT_SCHEMA,
    updatedAt: UPDATED_AT_SCHEMA,
    sequenceId: SEQUENCE_ID_SCHEMA,
    nonce: NONCE_SCHEMA,
    previousHash: PREVIOUS_HASH_SCHEMA,
    hash: HASH_SCHEMA,
  }).label(BLOCK_ATTRIBUTES_LABEL),
  relationships: Joi.object({
    transactions: Joi.array()
      .items({
        data: Joi.array()
          .items(READ_BLOCK_TRANSACTION_SCHEMA)
          .label(BLOCK_TRANSACTIONS_LABEL),
      })
      .min(1)
      .max(MAX_TRANSACTIONS_PER_BLOCK)
      .label(BLOCK_TRANSACTIONS_LABEL),
  }).label(BLOCK_TRANSACTION_RELATIONSHIPS_LABEL),
}).label(BLOCK_DATA_LABEL);

export const CREATE_BLOCK_SCHEMA = Joi.object({
  id: ID_SCHEMA.label(ID_LABEL),
  type: Joi.string().allow("block").label(TYPE_LABEL).required(),
  attributes: Joi.object({
    sequenceId: SEQUENCE_ID_SCHEMA.required(),
    nonce: NONCE_SCHEMA.required(),
    previousHash: PREVIOUS_HASH_SCHEMA.required(),
    hash: HASH_SCHEMA.required(),
  })
    .unknown(false)
    .label(BLOCK_ATTRIBUTES_LABEL)
    .required(),
  relationships: Joi.object({
    transactions: Joi.array()
      .items(
        Joi.object({
          data: CREATE_BLOCK_TRANSACTION_SCHEMA,
        }).label(BLOCK_TRANSACTION_LABEL)
      )
      .min(1)
      .max(MAX_TRANSACTIONS_PER_BLOCK)
      .label(BLOCK_TRANSACTIONS_LABEL)
      .required(),
  })
    .unknown(false)
    .label(BLOCK_RELATIONSHIPS_LABEL)
    .required(),
})
  .unknown(false)
  .label(BLOCK_DATA_LABEL)
  .required();
