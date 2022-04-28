import Joi from "joi";
import {
  MAX_TRANSACTIONS_PER_BLOCK,
  MAXIMUM_PAGE_SIZE,
} from "@xilution/todd-coin-constants";
import {
  OrganizationRoles,
  ParticipantRoles,
  TransactionType,
  TransactionTypes,
} from "@xilution/todd-coin-types";

const HASH_REGEX = /^([a-z0-9]){64}$/;
const PUBLIC_KEY_REGEX = /^([a-z0-9]){130}$/;
const SIGNATURE_REGEX = /^([a-z0-9]){142}$/;
const PHONE_REGEX = /^\(\d{3}\)\s\d{3}-\d{4}$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 32;
const ORGANIZATION_NAME_MIN = 2;
const ORGANIZATION_NAME_MAX = 250;
const DESCRIPTION_MIN = 1;
const DESCRIPTION_MAX = 512;
const GEO_LOCATION_POSITIONS_MAX = 500;
const LINKS_MAX = 25;
const DATE_RANGES_MAX = 25;
const ORGANIZATION_PARTICIPANTS_MAX = 100;

export const AUTH_SCHEMA = Joi.object({
  email: Joi.string().email().required().label("Email"),
  password: Joi.string()
    .min(PASSWORD_MIN)
    .max(PASSWORD_MAX)
    .required()
    .label("Password"),
}).unknown(false);

const GOOD_POINTS = Joi.number().integer().min(0).max(Number.MAX_SAFE_INTEGER);

const SIGNATURE = Joi.string().pattern(SIGNATURE_REGEX);

const DATE_RANGE = Joi.object({
  from: Joi.string().isoDate().required().label("From Date"),
  to: Joi.string().isoDate().required().label("To Date"),
});

// todo - add more constraints to geo location position input validation
const GEO_LOCATION_POSITION = Joi.object({
  coords: Joi.object({
    accuracy: Joi.number().required().label("Accuracy"),
    altitude: Joi.number().label("Altitude"),
    altitudeAccuracy: Joi.number().label("Altitude Accuracy"),
    heading: Joi.number().label("Heading"),
    latitude: Joi.number().required().label("Latitude"),
    longitude: Joi.number().required().label("Longitude"),
    speed: Joi.number().label("Speed"),
  })
    .required()
    .label("Coordinates"),
  timestamp: Joi.number().required().label("Epoch Time Stamp"),
});

const DESCRIPTION = Joi.string().min(DESCRIPTION_MIN).max(DESCRIPTION_MAX);

const LINK = Joi.object({
  description: DESCRIPTION.label("Description"),
  uri: Joi.string().uri().required().label("URI"),
});

const META_DATA = Joi.object({
  description: DESCRIPTION.label("Description"),
  geoLocationPositions: Joi.array()
    .items(GEO_LOCATION_POSITION)
    .min(0)
    .max(GEO_LOCATION_POSITIONS_MAX)
    .label("Geo Location Positions"),
  links: Joi.array().items(LINK).min(0).max(LINKS_MAX).label("Links"),
});

const TIME_TRANSACTION_DETAILS = Joi.object({
  dateRanges: Joi.array()
    .min(1)
    .max(DATE_RANGES_MAX)
    .items(DATE_RANGE)
    .required()
    .label("Date Ranges"),
  metaData: META_DATA.label("Meta Data"),
});

const CURRENCIES = Joi.string().allow(
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
);

const TREASURE_TRANSACTION_DETAILS = Joi.object({
  amount: Joi.number()
    .integer()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .required()
    .label("Amount"),
  currency: CURRENCIES.required().label("Currency"),
  metaData: META_DATA.label("Meta Data"),
});

const TRANSACTION_DETAILS = Joi.alt()
  .conditional("type", {
    is: TransactionType.TIME,
    then: TIME_TRANSACTION_DETAILS,
  })
  .conditional("type", {
    is: TransactionType.TREASURE,
    then: TREASURE_TRANSACTION_DETAILS,
  });

const BASE_TRANSACTION = Joi.object({
  from: Joi.string().pattern(PUBLIC_KEY_REGEX).required().label("From"),
  to: Joi.string().pattern(PUBLIC_KEY_REGEX).required().label("To"),
  type: Joi.string()
    .allow(...TransactionTypes)
    .required()
    .label("Type"),
  description: DESCRIPTION.label("Description"),
  details: TRANSACTION_DETAILS.required().label("Details"),
});

const PAGINATION_QUERY_SCHEMA = Joi.object({
  "page[number]": Joi.number()
    .min(0)
    .max(Number.MAX_SAFE_INTEGER)
    .label("Page Number"),
  "page[size]": Joi.number().min(1).max(MAXIMUM_PAGE_SIZE).label("Page Size"),
});

export const GET_BLOCKS_QUERY_SCHEMA = PAGINATION_QUERY_SCHEMA;

export const GET_BLOCK_PARAMETERS_SCHEMA = Joi.object({
  blockId: Joi.string().guid().label("Block ID"),
});

export const GET_PENDING_TRANSACTIONS_QUERY_SCHEMA =
  PAGINATION_QUERY_SCHEMA.keys({
    "filter[from]": Joi.string().regex(PUBLIC_KEY_REGEX).label("From Filter"),
    "filter[to]": Joi.string().regex(PUBLIC_KEY_REGEX).label("To Filter"),
  });

export const GET_PENDING_TRANSACTION_PARAMETERS_SCHEMA = Joi.object({
  pendingTransactionId: Joi.string().guid().label("Pending Transaction ID"),
});

export const GET_SIGNED_TRANSACTIONS_QUERY_SCHEMA = PAGINATION_QUERY_SCHEMA;

export const GET_SIGNED_TRANSACTION_PARAMETERS_SCHEMA = Joi.object({
  signedTransactionId: Joi.string().guid().label("Signed Transaction ID"),
});

export const GET_BLOCK_TRANSACTIONS_QUERY_SCHEMA = PAGINATION_QUERY_SCHEMA;

export const GET_BLOCK_TRANSACTIONS_PARAMETERS_SCHEMA = Joi.object({
  blockId: Joi.string().guid().label("Block ID"),
});

export const GET_BLOCK_TRANSACTION_PARAMETERS_SCHEMA = Joi.object({
  blockId: Joi.string().guid().label("Block ID"),
  blockTransactionId: Joi.string().guid().label("Block Transaction ID"),
});

export const GET_PARTICIPANTS_QUERY_SCHEMA = PAGINATION_QUERY_SCHEMA.keys({
  "filter[publicKey]": Joi.string()
    .regex(PUBLIC_KEY_REGEX)
    .label("Public Key Filter"),
});

export const GET_PARTICIPANT_PARAMETERS_SCHEMA = Joi.object({
  participantId: Joi.string().guid().label("Participant ID"),
});

export const GET_PARTICIPANT_KEY_PARAMETERS_SCHEMA = Joi.object({
  participantKeyId: Joi.string().guid().label("Participant Key ID"),
});

export const GET_NODES_QUERY_SCHEMA = PAGINATION_QUERY_SCHEMA;

export const GET_NODE_PARAMETERS_SCHEMA = Joi.object({
  nodeId: Joi.string().guid().label("Node ID"),
});

export const GET_ORGANIZATIONS_QUERY_SCHEMA = PAGINATION_QUERY_SCHEMA;

export const GET_ORGANIZATION_PARAMETERS_SCHEMA = Joi.object({
  organizationId: Joi.string().guid().label("Organization ID"),
});

export const POST_PENDING_TRANSACTION_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: BASE_TRANSACTION.unknown(false).required().label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const PATCH_PENDING_TRANSACTION_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      description: DESCRIPTION.label("Description"),
      details: TRANSACTION_DETAILS.label("Details"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const POST_SIGNED_TRANSACTION_SCHEMA = Joi.object({
  data: Joi.object({
    id: Joi.string().guid().required().label("ID"),
    attributes: BASE_TRANSACTION.keys({
      goodPoints: GOOD_POINTS.required().label("Good Points"),
      signature: SIGNATURE.required().label("Signature"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const PATCH_SIGNED_TRANSACTION_SCHEMA = Joi.object({
  data: Joi.object({
    id: Joi.string().guid().required().label("ID"),
    attributes: Joi.object({
      description: DESCRIPTION.label("Description"),
      details: TRANSACTION_DETAILS.label("Details"),
      goodPoints: GOOD_POINTS.label("Good Points"),
      signature: SIGNATURE.required().label("Signature"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const POST_BLOCK_SCHEMA = Joi.object({
  data: Joi.object({
    id: Joi.string().guid().required().label("ID"),
    attributes: Joi.object({
      sequenceId: Joi.number()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .required()
        .label("Sequence ID"),
      nonce: Joi.number()
        .integer()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .required()
        .label("Nonce"),
      previousHash: Joi.string()
        .pattern(HASH_REGEX)
        .required()
        .label("Previous Hash"),
      hash: Joi.string().pattern(HASH_REGEX).required().label("Hash"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
    relationships: Joi.object({
      transactions: Joi.array()
        .items(POST_SIGNED_TRANSACTION_SCHEMA)
        .min(1)
        .max(MAX_TRANSACTIONS_PER_BLOCK)
        .required()
        .label("Transactions"),
    })
      .unknown(false)
      .required()
      .label("Relationships"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const POST_PARTICIPANT_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      email: Joi.string().email().required().label("Email"),
      password: Joi.string()
        .min(PASSWORD_MIN)
        .max(PASSWORD_MAX)
        .required()
        .label("Password"),
      firstName: Joi.string().min(3).max(100).label("First Name"),
      lastName: Joi.string().min(3).max(100).label("Last Name"),
      phone: Joi.string().pattern(PHONE_REGEX).label("Phone"),
      roles: Joi.array()
        .items(
          Joi.string()
            .allow(...ParticipantRoles)
            .label("Role Types")
        )
        .min(1)
        .required()
        .label("Roles"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const PATCH_PARTICIPANT_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      email: Joi.string().email().label("Email"),
      password: Joi.string()
        .min(PASSWORD_MIN)
        .max(PASSWORD_MAX)
        .label("Password"),
      firstName: Joi.string().min(3).max(100).label("First Name"),
      lastName: Joi.string().min(3).max(100).label("Last Name"),
      phone: Joi.string().pattern(PHONE_REGEX).label("Phone"),
      roles: Joi.array()
        .items(
          Joi.string()
            .allow(...ParticipantRoles)
            .label("Participant Role Types")
        )
        .min(1)
        .label("Roles"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const POST_PARTICIPANT_KEY_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: Joi.object({}).unknown(false).required().label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const PATCH_PARTICIPANT_KEY_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: Joi.object({}).unknown(false).required().label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const POST_NODE_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      baseUrl: Joi.string().uri().required().label("Base Url"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const PATCH_NODE_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      baseUrl: Joi.string().uri().label("Base Url"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const POST_ORGANIZATION_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      email: Joi.string().email().required().label("Email"),
      name: Joi.string()
        .min(ORGANIZATION_NAME_MIN)
        .max(ORGANIZATION_NAME_MAX)
        .required()
        .label("Name"),
      phone: Joi.string().pattern(PHONE_REGEX).label("Phone"),
      roles: Joi.array()
        .items(
          Joi.string()
            .allow(...OrganizationRoles)
            .label("Organization Role Types")
        )
        .min(1)
        .required()
        .label("Roles"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const PATCH_ORGANIZATION_SCHEMA = Joi.object({
  data: Joi.object({
    attributes: Joi.object({
      email: Joi.string().email().label("Email"),
      name: Joi.string()
        .min(ORGANIZATION_NAME_MIN)
        .max(ORGANIZATION_NAME_MAX)
        .label("Name"),
      phone: Joi.string().pattern(PHONE_REGEX).label("Phone"),
      roles: Joi.array()
        .items(
          Joi.string()
            .allow(...OrganizationRoles)
            .label("Organization Role Types")
        )
        .min(1)
        .label("Roles"),
    })
      .unknown(false)
      .required()
      .label("Attributes"),
  })
    .unknown(false)
    .required()
    .label("Data"),
}).unknown(false);

export const POST_ORGANIZATION_PARTICIPANTS_SCHEMA = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().guid().required().label("ID"),
        type: Joi.string().allow("participant").required().label("Type"),
      }).label("Participants")
    )
    .min(1)
    .max(ORGANIZATION_PARTICIPANTS_MAX)
    .required()
    .label("Data"),
}).unknown(false);

export const POST_PARTICIPANTS_ORGANIZATION_SCHEMA = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().guid().required().label("ID"),
        type: Joi.string().allow("organization").required().label("Type"),
      }).label("Organizations")
    )
    .min(1)
    .max(ORGANIZATION_PARTICIPANTS_MAX)
    .required()
    .label("Data"),
}).unknown(false);
