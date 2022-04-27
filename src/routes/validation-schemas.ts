import Joi from "joi";
import {
  MAX_TRANSACTIONS_PER_BLOCK,
  MAXIMUM_PAGE_SIZE,
} from "@xilution/todd-coin-constants";
import {
  OrganizationRole,
  OrganizationRoles,
  ParticipantRole,
  ParticipantRoles,
} from "@xilution/todd-coin-types";

const HASH_REGEX = /^([a-z0-9]){64}$/;
const PUBLIC_KEY_REGEX = /^([a-z0-9]){130}$/;
const SIGNATURE_REGEX = /^([a-z0-9]){142}$/;
const PHONE_REGEX = /^\(\d{3}\)\s\d{3}-\d{4}$/;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 32;
const ORGANIZATION_NAME_MIN = 2;
const ORGANIZATION_NAME_MAX = 250;

export const AUTH_SCHEMA = Joi.object({
  email: Joi.string().email().required().label("Email"),
  password: Joi.string()
    .min(PASSWORD_MIN)
    .max(PASSWORD_MAX)
    .required()
    .label("Password"),
}).unknown(false);

const BASE_TRANSACTION = Joi.object({
  from: Joi.string().pattern(PUBLIC_KEY_REGEX).required().label("From"),
  to: Joi.string().pattern(PUBLIC_KEY_REGEX).required().label("To"),
  description: Joi.string().min(1).max(512).label("Description"),
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

export const GET_PARTICIPANT_KEYS_QUERY_SCHEMA = PAGINATION_QUERY_SCHEMA;

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

export const POST_SIGNED_TRANSACTION_SCHEMA = Joi.object({
  data: Joi.object({
    id: Joi.string().guid().required().label("ID"),
    attributes: BASE_TRANSACTION.keys({
      goodPoints: Joi.number()
        .integer()
        .min(0)
        .max(Number.MAX_SAFE_INTEGER)
        .required()
        .label("Good Points"),
      signature: Joi.string()
        .pattern(SIGNATURE_REGEX)
        .required()
        .label("Signature"),
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
            .valid(...ParticipantRoles)
            .min(1)
            .required()
            .label("Role Types")
        )
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

export const POST_PARTICIPANT_KEY_SCHEMA = Joi.object({
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
            .valid(...OrganizationRoles)
            .min(1)
            .required()
            .label("Role Types")
        )
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

export const POST_ORGANIZATION_PARTICIPANTS_SCHEMA = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().guid().required().label("ID"),
        type: Joi.string().valid("participant").required().label("Type"),
      })
    )
    .required()
    .label("Data"),
}).unknown(false);

export const POST_PARTICIPANTS_ORGANIZATION_SCHEMA = Joi.object({
  data: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().guid().required().label("ID"),
        type: Joi.string().valid("organization").required().label("Type"),
      })
    )
    .required()
    .label("Data"),
}).unknown(false);
