import { Linker, Metaizer, Paginator, Relator, Serializer } from "ts-japi";
import { ApiSettings } from "../types";
import {
  Block,
  BlockTransaction,
  Node,
  Organization,
  Participant,
  ParticipantKey,
  PendingTransaction,
  SignedTransaction,
  TransactionDetails,
} from "@xilution/todd-coin-types";
import _ from "lodash";
import {
  DEFAULT_PAGE_SIZE,
  FIRST_PAGE,
  MAX_TRANSACTIONS_PER_BLOCK,
} from "@xilution/todd-coin-constants";
import { nullish, SingleOrArray } from "ts-japi/lib/types/global.types";

export const buildBlockSerializer = (
  apiSettings: ApiSettings
): Serializer<Block> => {
  return new Serializer<Block>("block", {
    nullData: false,
    projection: {
      transactions: 0,
    },
    relators: {
      transactions: new Relator<Block, BlockTransaction<TransactionDetails>>(
        async (block: Block) => block.transactions,
        new Serializer<BlockTransaction<TransactionDetails>>("transaction", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[Block]>((block: Block) => {
              return `${apiSettings.apiBaseUrl}/blocks/${block.id}/transactions?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`;
            }),
          },
        }
      ),
    },
    linkers: {
      document: new Linker<[SingleOrArray<Block> | nullish]>(
        (block: nullish | SingleOrArray<Block>) => {
          if (!Array.isArray(block) && block) {
            return `${apiSettings.apiBaseUrl}/blocks/${block.id}`;
          }
          return `${apiSettings.apiBaseUrl}/blocks`;
        }
      ),
      resource: new Linker<Block[]>((block: Block) => {
        return `${apiSettings.apiBaseUrl}/blocks/${block.id}`;
      }),
    },
  });
};

export const buildBlocksSerializer = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number
): Serializer<Block> => {
  const pages = Math.ceil(count / pageSize);

  return new Serializer<Block>("block", {
    nullData: false,
    projection: {
      transactions: 0,
    },
    relators: {
      transactions: new Relator<Block, BlockTransaction<TransactionDetails>>(
        async (block: Block) => block.transactions,
        new Serializer<BlockTransaction<TransactionDetails>>("transaction", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[Block]>((block: Block) => {
              return `${apiSettings.apiBaseUrl}/blocks/${block.id}/transactions?page[number]=${FIRST_PAGE}&page[size]=${MAX_TRANSACTIONS_PER_BLOCK}`;
            }),
          },
        }
      ),
    },
    linkers: {
      document: new Linker(() => {
        return `${apiSettings.apiBaseUrl}/blocks?page[number]=${pageNumber}&page[size]=${pageSize}`;
      }),
      resource: new Linker((block: Block) => {
        return `${apiSettings.apiBaseUrl}/blocks/${block.id}`;
      }),
      paginator: new Paginator(() => {
        const nextPage = pageNumber + 1;
        const previousPage = pageNumber - 1;
        return {
          first: `${apiSettings.apiBaseUrl}/blocks?page[number]=${FIRST_PAGE}&page[size]=${pageSize}`,
          last: `${apiSettings.apiBaseUrl}/blocks?page[number]=${pages}&page[size]=${pageSize}`,
          next:
            nextPage <= pages
              ? `${apiSettings.apiBaseUrl}/blocks?page[number]=${nextPage}&page[size]=${pageSize}`
              : null,
          prev:
            previousPage >= 0
              ? `${apiSettings.apiBaseUrl}/blocks?page[number]=${previousPage}&page[size]=${pageSize}`
              : null,
        };
      }),
    },
    metaizers: {
      document: new Metaizer(() => ({
        itemsPerPage: pageSize,
        totalItems: count,
        currentPage: pageNumber,
        totalPages: pages,
      })),
    },
  });
};

export const buildPendingTransactionSerializer = (
  apiSettings: ApiSettings
): Serializer<PendingTransaction<TransactionDetails>> => {
  return new Serializer<PendingTransaction<TransactionDetails>>(
    "pending-transaction",
    {
      nullData: false,
      projection: {
        from: 0,
        to: 0,
      },
      relators: {
        from: new Relator<PendingTransaction<TransactionDetails>, Participant>(
          async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
            pendingTransaction.from,
          new Serializer<Participant>("participant", {
            onlyIdentifier: true,
          }),
          {
            linkers: {
              related: new Linker<[PendingTransaction<TransactionDetails>]>(
                (
                  pendingTransaction: PendingTransaction<TransactionDetails>
                ) => {
                  return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.from?.id}`;
                }
              ),
            },
          }
        ),
        to: new Relator<PendingTransaction<TransactionDetails>, Participant>(
          async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
            pendingTransaction.to,
          new Serializer<Participant>("participant", {
            onlyIdentifier: true,
          }),
          {
            linkers: {
              related: new Linker<[PendingTransaction<TransactionDetails>]>(
                (
                  pendingTransaction: PendingTransaction<TransactionDetails>
                ) => {
                  return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.to?.id}`;
                }
              ),
            },
          }
        ),
      },
      linkers: {
        document: new Linker<
          [SingleOrArray<PendingTransaction<TransactionDetails>> | nullish]
        >(
          (
            pendingTransaction:
              | nullish
              | SingleOrArray<PendingTransaction<TransactionDetails>>
          ) => {
            if (!Array.isArray(pendingTransaction) && pendingTransaction) {
              return `${apiSettings.apiBaseUrl}/pending-transactions/${pendingTransaction.id}`;
            }
            return `${apiSettings.apiBaseUrl}/pending-transactions`;
          }
        ),
        resource: new Linker(
          (pendingTransaction: PendingTransaction<TransactionDetails>) => {
            return `${apiSettings.apiBaseUrl}/pending-transactions/${pendingTransaction.id}`;
          }
        ),
      },
    }
  );
};

export const buildPendingTransactionsSerializer = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number
): Serializer<PendingTransaction<TransactionDetails>> => {
  const pages = Math.ceil(count / pageSize);

  return new Serializer<PendingTransaction<TransactionDetails>>(
    "pending-transaction",
    {
      nullData: false,
      projection: {
        from: 0,
        to: 0,
      },
      linkers: {
        document: new Linker(() => {
          return `${apiSettings.apiBaseUrl}/pending-transactions?page[number]=${pageNumber}&page[size]=${pageSize}`;
        }),
        resource: new Linker(
          (pendingTransaction: PendingTransaction<TransactionDetails>) => {
            return `${apiSettings.apiBaseUrl}/pending-transactions/${pendingTransaction.id}`;
          }
        ),
        paginator: new Paginator(() => {
          const nextPage = pageNumber + 1;
          const previousPage = pageNumber - 1;
          return {
            first: `${apiSettings.apiBaseUrl}/pending-transactions?page[number]=${FIRST_PAGE}&page[size]=${pageSize}`,
            last: `${apiSettings.apiBaseUrl}/pending-transactions?page[number]=${pages}&page[size]=${pageSize}`,
            next:
              nextPage <= pages
                ? `${apiSettings.apiBaseUrl}/pending-transactions?page[number]=${nextPage}&page[size]=${pageSize}`
                : null,
            prev:
              previousPage >= 0
                ? `${apiSettings.apiBaseUrl}/pending-transactions?page[number]=${previousPage}&page[size]=${pageSize}`
                : null,
          };
        }),
      },
      relators: {
        from: new Relator<PendingTransaction<TransactionDetails>, Participant>(
          async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
            pendingTransaction.from,
          new Serializer<Participant>("participant", {
            onlyIdentifier: true,
          }),
          {
            linkers: {
              related: new Linker<[PendingTransaction<TransactionDetails>]>(
                (
                  pendingTransaction: PendingTransaction<TransactionDetails>
                ) => {
                  return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.from?.id}`;
                }
              ),
            },
          }
        ),
        to: new Relator<PendingTransaction<TransactionDetails>, Participant>(
          async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
            pendingTransaction.to,
          new Serializer<Participant>("participant", {
            onlyIdentifier: true,
          }),
          {
            linkers: {
              related: new Linker<[PendingTransaction<TransactionDetails>]>(
                (
                  pendingTransaction: PendingTransaction<TransactionDetails>
                ) => {
                  return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.to?.id}`;
                }
              ),
            },
          }
        ),
      },
      metaizers: {
        document: new Metaizer(() => ({
          itemsPerPage: pageSize,
          totalItems: count,
          currentPage: pageNumber,
          totalPages: pages,
        })),
      },
    }
  );
};

export const buildSignedTransactionSerializer = (
  apiSettings: ApiSettings
): Serializer<SignedTransaction<TransactionDetails>> => {
  return new Serializer<SignedTransaction<TransactionDetails>>(
    "signed-transaction",
    {
      nullData: false,
      projection: {
        from: 0,
        to: 0,
      },
      relators: {
        from: new Relator<PendingTransaction<TransactionDetails>, Participant>(
          async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
            pendingTransaction.from,
          new Serializer<Participant>("participant", {
            onlyIdentifier: true,
          }),
          {
            linkers: {
              related: new Linker<[PendingTransaction<TransactionDetails>]>(
                (
                  pendingTransaction: PendingTransaction<TransactionDetails>
                ) => {
                  return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.from?.id}`;
                }
              ),
            },
          }
        ),
        to: new Relator<PendingTransaction<TransactionDetails>, Participant>(
          async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
            pendingTransaction.to,
          new Serializer<Participant>("participant", {
            onlyIdentifier: true,
          }),
          {
            linkers: {
              related: new Linker<[PendingTransaction<TransactionDetails>]>(
                (
                  pendingTransaction: PendingTransaction<TransactionDetails>
                ) => {
                  return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.to?.id}`;
                }
              ),
            },
          }
        ),
      },
      linkers: {
        document: new Linker<
          [SingleOrArray<SignedTransaction<TransactionDetails>> | nullish]
        >(
          (
            signedTransaction:
              | nullish
              | SingleOrArray<SignedTransaction<TransactionDetails>>
          ) => {
            if (!Array.isArray(signedTransaction) && signedTransaction) {
              return `${apiSettings.apiBaseUrl}/signed-transactions/${signedTransaction.id}`;
            }
            return `${apiSettings.apiBaseUrl}/signed-transactions`;
          }
        ),
        resource: new Linker(
          (signedTransaction: SignedTransaction<TransactionDetails>) => {
            return `${apiSettings.apiBaseUrl}/signed-transactions/${signedTransaction.id}`;
          }
        ),
      },
    }
  );
};

export const buildSignedTransactionsSerializer = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number
): Serializer<SignedTransaction<TransactionDetails>> => {
  const pages = Math.ceil(count / pageSize);

  return new Serializer<SignedTransaction<TransactionDetails>>(
    "signed-transaction",
    {
      nullData: false,
      projection: {
        from: 0,
        to: 0,
      },
      relators: {
        from: new Relator<PendingTransaction<TransactionDetails>, Participant>(
          async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
            pendingTransaction.from,
          new Serializer<Participant>("participant", {
            onlyIdentifier: true,
          }),
          {
            linkers: {
              related: new Linker<[PendingTransaction<TransactionDetails>]>(
                (
                  pendingTransaction: PendingTransaction<TransactionDetails>
                ) => {
                  return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.from?.id}`;
                }
              ),
            },
          }
        ),
        to: new Relator<PendingTransaction<TransactionDetails>, Participant>(
          async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
            pendingTransaction.to,
          new Serializer<Participant>("participant", {
            onlyIdentifier: true,
          }),
          {
            linkers: {
              related: new Linker<[PendingTransaction<TransactionDetails>]>(
                (
                  pendingTransaction: PendingTransaction<TransactionDetails>
                ) => {
                  return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.to?.id}`;
                }
              ),
            },
          }
        ),
      },
      linkers: {
        document: new Linker(() => {
          return `${apiSettings.apiBaseUrl}/signed-transactions?page[number]=${pageNumber}&page[size]=${pageSize}`;
        }),
        resource: new Linker(
          (signedTransaction: SignedTransaction<TransactionDetails>) => {
            return `${apiSettings.apiBaseUrl}/signed-transactions/${signedTransaction.id}`;
          }
        ),
        paginator: new Paginator(() => {
          const nextPage = pageNumber + 1;
          const previousPage = pageNumber - 1;
          return {
            first: `${apiSettings.apiBaseUrl}/signed-transactions?page[number]=${FIRST_PAGE}&page[size]=${pageSize}`,
            last: `${apiSettings.apiBaseUrl}/signed-transactions?page[number]=${pages}&page[size]=${pageSize}`,
            next:
              nextPage <= pages
                ? `${apiSettings.apiBaseUrl}/signed-transactions?page[number]=${nextPage}&page[size]=${pageSize}`
                : null,
            prev:
              previousPage >= 0
                ? `${apiSettings.apiBaseUrl}/signed-transactions?page[number]=${previousPage}&page[size]=${pageSize}`
                : null,
          };
        }),
      },
      metaizers: {
        document: new Metaizer(() => ({
          itemsPerPage: pageSize,
          totalItems: count,
          currentPage: pageNumber,
          totalPages: pages,
        })),
      },
    }
  );
};

export const buildBlockTransactionSerializer = (
  apiSettings: ApiSettings
): Serializer<BlockTransaction<TransactionDetails>> => {
  return new Serializer<BlockTransaction<TransactionDetails>>("transaction", {
    nullData: false,
    projection: {
      block: 0,
      from: 0,
      to: 0,
    },
    relators: {
      block: new Relator<BlockTransaction<TransactionDetails>, Block>(
        async (blockTransaction: BlockTransaction<TransactionDetails>) =>
          blockTransaction.block,
        new Serializer<Block>("block", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker(
              (blockTransaction: BlockTransaction<TransactionDetails>) => {
                return `${apiSettings.apiBaseUrl}/blocks/${blockTransaction.id}`;
              }
            ),
          },
        }
      ),
      from: new Relator<PendingTransaction<TransactionDetails>, Participant>(
        async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
          pendingTransaction.from,
        new Serializer<Participant>("participant", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[PendingTransaction<TransactionDetails>]>(
              (pendingTransaction: PendingTransaction<TransactionDetails>) => {
                return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.from?.id}`;
              }
            ),
          },
        }
      ),
      to: new Relator<PendingTransaction<TransactionDetails>, Participant>(
        async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
          pendingTransaction.to,
        new Serializer<Participant>("participant", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[PendingTransaction<TransactionDetails>]>(
              (pendingTransaction: PendingTransaction<TransactionDetails>) => {
                return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.to?.id}`;
              }
            ),
          },
        }
      ),
    },
    linkers: {
      document: new Linker<
        [SingleOrArray<BlockTransaction<TransactionDetails>> | nullish]
      >(
        (
          blockTransaction:
            | nullish
            | SingleOrArray<BlockTransaction<TransactionDetails>>
        ) => {
          if (!Array.isArray(blockTransaction) && blockTransaction) {
            return `${apiSettings.apiBaseUrl}/blocks/${blockTransaction.block?.id}/transactions/${blockTransaction.id}`;
          }
          return `${apiSettings.apiBaseUrl}/blocks/${
            _.first(blockTransaction)?.block?.id
          }/transactions`;
        }
      ),
      resource: new Linker(
        (blockTransaction: BlockTransaction<TransactionDetails>) => {
          return `${apiSettings.apiBaseUrl}/blocks/${blockTransaction.block?.id}/transactions/${blockTransaction.id}`;
        }
      ),
    },
  });
};

export const buildBlockTransactionsSerializer = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number
): Serializer<BlockTransaction<TransactionDetails>> => {
  const pages = Math.ceil(count / pageSize);

  return new Serializer<BlockTransaction<TransactionDetails>>("transaction", {
    nullData: false,
    projection: {
      block: 0,
      from: 0,
      to: 0,
    },
    relators: {
      block: new Relator<BlockTransaction<TransactionDetails>, Block>(
        async (blockTransaction: BlockTransaction<TransactionDetails>) =>
          blockTransaction.block,
        new Serializer<Block>("block", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker(
              (blockTransaction: BlockTransaction<TransactionDetails>) => {
                return `${apiSettings.apiBaseUrl}/blocks/${blockTransaction.id}`;
              }
            ),
          },
        }
      ),
      from: new Relator<PendingTransaction<TransactionDetails>, Participant>(
        async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
          pendingTransaction.from,
        new Serializer<Participant>("participant", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[PendingTransaction<TransactionDetails>]>(
              (pendingTransaction: PendingTransaction<TransactionDetails>) => {
                return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.from?.id}`;
              }
            ),
          },
        }
      ),
      to: new Relator<PendingTransaction<TransactionDetails>, Participant>(
        async (pendingTransaction: PendingTransaction<TransactionDetails>) =>
          pendingTransaction.to,
        new Serializer<Participant>("participant", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[PendingTransaction<TransactionDetails>]>(
              (pendingTransaction: PendingTransaction<TransactionDetails>) => {
                return `${apiSettings.apiBaseUrl}/participants/${pendingTransaction.to?.id}`;
              }
            ),
          },
        }
      ),
    },
    linkers: {
      document: new Linker<
        [SingleOrArray<BlockTransaction<TransactionDetails>> | nullish]
      >(
        (
          blockTransaction:
            | nullish
            | SingleOrArray<BlockTransaction<TransactionDetails>>
        ) => {
          if (!Array.isArray(blockTransaction) && blockTransaction) {
            return `${apiSettings.apiBaseUrl}/blocks/${blockTransaction.block?.id}/transactions/${blockTransaction.id}`;
          }
          return `${apiSettings.apiBaseUrl}/blocks/${
            _.first(blockTransaction)?.block?.id
          }/transactions`;
        }
      ),
      resource: new Linker(
        (blockTransaction: BlockTransaction<TransactionDetails>) => {
          return `${apiSettings.apiBaseUrl}/blocks/${blockTransaction.block?.id}/transactions/${blockTransaction.id}`;
        }
      ),
      paginator: new Paginator(
        (
          blockTransaction:
            | nullish
            | SingleOrArray<BlockTransaction<TransactionDetails>>
        ) => {
          if (!Array.isArray(blockTransaction) && blockTransaction) {
            return;
          }
          const nextPage = pageNumber + 1;
          const previousPage = pageNumber - 1;
          return {
            first: `${apiSettings.apiBaseUrl}/blocks/${
              _.first(blockTransaction)?.block?.id
            }/transactions?page[number]=${FIRST_PAGE}&page[size]=${pageSize}`,
            last: `${apiSettings.apiBaseUrl}/blocks/${
              _.first(blockTransaction)?.block?.id
            }/transactions?page[number]=${pages}&page[size]=${pageSize}`,
            next:
              nextPage <= pages
                ? `${apiSettings.apiBaseUrl}/blocks/${
                    _.first(blockTransaction)?.block?.id
                  }/transactions?page[number]=${nextPage}&page[size]=${pageSize}`
                : null,
            prev:
              previousPage >= 0
                ? `${apiSettings.apiBaseUrl}/blocks/${
                    _.first(blockTransaction)?.block?.id
                  }/transactions?page[number]=${previousPage}&page[size]=${pageSize}`
                : null,
          };
        }
      ),
    },
    metaizers: {
      document: new Metaizer(() => ({
        itemsPerPage: pageSize,
        totalItems: count,
        currentPage: pageNumber,
        totalPages: pages,
      })),
    },
  });
};

export const buildParticipantSerializer = (
  apiSettings: ApiSettings
): Serializer<Participant> => {
  return new Serializer<Participant>("participant", {
    nullData: false,
    projection: {
      password: 0,
      keys: 0,
      organizations: 0,
    },
    relators: {
      keys: new Relator<Participant, ParticipantKey>(
        async (participant: Participant) => participant.keys,
        new Serializer<ParticipantKey>("key", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[Participant]>(() => {
              return `${apiSettings.apiBaseUrl}/participant-keys?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`;
            }),
          },
        }
      ),
      organizations: new Relator<Participant, Organization>(
        async (block: Participant) => block.organizations,
        new Serializer<Organization>("organization", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[Participant]>(() => {
              return `${apiSettings.apiBaseUrl}/organizations?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`;
            }),
          },
        }
      ),
    },
    linkers: {
      document: new Linker<[SingleOrArray<Participant> | nullish]>(
        (participant: nullish | SingleOrArray<Participant>) => {
          if (!Array.isArray(participant) && participant) {
            return `${apiSettings.apiBaseUrl}/participants/${participant.id}`;
          }
          return `${apiSettings.apiBaseUrl}/participants`;
        }
      ),
      resource: new Linker((participant: Participant) => {
        return `${apiSettings.apiBaseUrl}/participants/${participant.id}`;
      }),
    },
  });
};

export const buildParticipantsSerializer = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number
): Serializer<Participant> => {
  const pages = Math.ceil(count / pageSize);

  return new Serializer<Participant>("participant", {
    nullData: false,
    projection: {
      password: 0,
      keys: 0,
      organizations: 0,
    },
    relators: {
      keys: new Relator<Participant, ParticipantKey>(
        async (participant: Participant) => participant.keys,
        new Serializer<ParticipantKey>("key", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[Participant]>((participant: Participant) => {
              return `${apiSettings.apiBaseUrl}/participants/${participant.id}/participant-keys?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`;
            }),
          },
        }
      ),
      organizations: new Relator<Participant, Organization>(
        async (block: Participant) => block.organizations,
        new Serializer<Organization>("organization", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[Participant]>(() => {
              return `${apiSettings.apiBaseUrl}/organizations?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`;
            }),
          },
        }
      ),
    },
    linkers: {
      document: new Linker(() => {
        return `${apiSettings.apiBaseUrl}/participants?page[number]=${pageNumber}&page[size]=${pageSize}`;
      }),
      resource: new Linker((participant: Participant) => {
        return `${apiSettings.apiBaseUrl}/participants/${participant.id}`;
      }),
      paginator: new Paginator(() => {
        const nextPage = pageNumber + 1;
        const previousPage = pageNumber - 1;
        return {
          first: `${apiSettings.apiBaseUrl}/participants?page[number]=${FIRST_PAGE}&page[size]=${pageSize}`,
          last: `${apiSettings.apiBaseUrl}/participants?page[number]=${pages}&page[size]=${pageSize}`,
          next:
            nextPage <= pages
              ? `${apiSettings.apiBaseUrl}/participants?page[number]=${nextPage}&page[size]=${pageSize}`
              : null,
          prev:
            previousPage >= 0
              ? `${apiSettings.apiBaseUrl}/participants?page[number]=${previousPage}&page[size]=${pageSize}`
              : null,
        };
      }),
    },
    metaizers: {
      document: new Metaizer(() => ({
        itemsPerPage: pageSize,
        totalItems: count,
        currentPage: pageNumber,
        totalPages: pages,
      })),
    },
  });
};

export const buildParticipantKeySerializer = (
  apiSettings: ApiSettings
): Serializer<ParticipantKey> => {
  return new Serializer<ParticipantKey>("participant-key", {
    nullData: false,
    linkers: {
      document: new Linker<[SingleOrArray<ParticipantKey> | nullish]>(
        (participantKey: nullish | SingleOrArray<ParticipantKey>) => {
          if (!Array.isArray(participantKey) && participantKey) {
            return `${apiSettings.apiBaseUrl}/participant-keys/${participantKey.id}`;
          }
          return `${apiSettings.apiBaseUrl}/participant-keys`;
        }
      ),
      resource: new Linker((participantKey: ParticipantKey) => {
        return `${apiSettings.apiBaseUrl}/participants/${participantKey.id}`;
      }),
    },
  });
};

export const buildParticipantKeysSerializer = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number
): Serializer<ParticipantKey> => {
  const pages = Math.ceil(count / pageSize);

  return new Serializer<ParticipantKey>("participant-key", {
    nullData: false,
    linkers: {
      document: new Linker(() => {
        return `${apiSettings.apiBaseUrl}/participants?page[number]=${pageNumber}&page[size]=${pageSize}`;
      }),
      resource: new Linker((participantKey: ParticipantKey) => {
        return `${apiSettings.apiBaseUrl}/participant-keys/${participantKey.id}`;
      }),
      paginator: new Paginator(() => {
        const nextPage = pageNumber + 1;
        const previousPage = pageNumber - 1;
        return {
          first: `${apiSettings.apiBaseUrl}/participant-keys?page[number]=${FIRST_PAGE}&page[size]=${pageSize}`,
          last: `${apiSettings.apiBaseUrl}/participant-keys?page[number]=${pages}&page[size]=${pageSize}`,
          next:
            nextPage <= pages
              ? `${apiSettings.apiBaseUrl}/participant-keys?page[number]=${nextPage}&page[size]=${pageSize}`
              : null,
          prev:
            previousPage >= 0
              ? `${apiSettings.apiBaseUrl}/participant-keys?page[number]=${previousPage}&page[size]=${pageSize}`
              : null,
        };
      }),
    },
    metaizers: {
      document: new Metaizer(() => ({
        itemsPerPage: pageSize,
        totalItems: count,
        currentPage: pageNumber,
        totalPages: pages,
      })),
    },
  });
};

export const buildOrganizationSerializer = (
  apiSettings: ApiSettings
): Serializer<Organization> => {
  return new Serializer<Organization>("organization", {
    nullData: false,
    projection: {
      participants: 0,
    },
    relators: {
      participants: new Relator<Organization, Participant>(
        async (organization: Organization) => organization.participants,
        new Serializer<Participant>("participant", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[Organization]>(() => {
              return `${apiSettings.apiBaseUrl}/participants?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`;
            }),
          },
        }
      ),
    },
    linkers: {
      document: new Linker<[SingleOrArray<Organization> | nullish]>(
        (organization: nullish | SingleOrArray<Organization>) => {
          if (!Array.isArray(organization) && organization) {
            return `${apiSettings.apiBaseUrl}/organizations/${organization.id}`;
          }
          return `${apiSettings.apiBaseUrl}/organizations`;
        }
      ),
      resource: new Linker((organization: Organization) => {
        return `${apiSettings.apiBaseUrl}/organizations/${organization.id}`;
      }),
    },
  });
};

export const buildOrganizationsSerializer = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number
): Serializer<Organization> => {
  const pages = Math.ceil(count / pageSize);

  return new Serializer<Organization>("organization", {
    nullData: false,
    projection: {
      participants: 0,
    },
    relators: {
      participants: new Relator<Organization, Participant>(
        async (organization: Organization) => organization.participants,
        new Serializer<Participant>("participant", {
          onlyIdentifier: true,
        }),
        {
          linkers: {
            related: new Linker<[Organization]>(() => {
              return `${apiSettings.apiBaseUrl}/participants?page[number]=${FIRST_PAGE}&page[size]=${DEFAULT_PAGE_SIZE}`;
            }),
          },
        }
      ),
    },
    linkers: {
      document: new Linker(() => {
        return `${apiSettings.apiBaseUrl}/organizations?page[number]=${pageNumber}&page[size]=${pageSize}`;
      }),
      resource: new Linker((organization: Organization) => {
        return `${apiSettings.apiBaseUrl}/organizations/${organization.id}`;
      }),
      paginator: new Paginator(() => {
        const nextPage = pageNumber + 1;
        const previousPage = pageNumber - 1;
        return {
          first: `${apiSettings.apiBaseUrl}/organizations?page[number]=${FIRST_PAGE}&page[size]=${pageSize}`,
          last: `${apiSettings.apiBaseUrl}/organizations?page[number]=${pages}&page[size]=${pageSize}`,
          next:
            nextPage <= pages
              ? `${apiSettings.apiBaseUrl}/organizations?page[number]=${nextPage}&page[size]=${pageSize}`
              : null,
          prev:
            previousPage >= 0
              ? `${apiSettings.apiBaseUrl}/organizations?page[number]=${previousPage}&page[size]=${pageSize}`
              : null,
        };
      }),
    },
    metaizers: {
      document: new Metaizer(() => ({
        itemsPerPage: pageSize,
        totalItems: count,
        currentPage: pageNumber,
        totalPages: pages,
      })),
    },
  });
};

export const buildNodeSerializer = (
  apiSettings: ApiSettings
): Serializer<Node> => {
  return new Serializer<Node>("node", {
    nullData: false,
    linkers: {
      document: new Linker<[SingleOrArray<Node> | nullish]>(
        (node: nullish | SingleOrArray<Node>) => {
          if (!Array.isArray(node) && node) {
            return `${apiSettings.apiBaseUrl}/nodes/${node.id}`;
          }
          return `${apiSettings.apiBaseUrl}/nodes`;
        }
      ),
      resource: new Linker((node: Node) => {
        return `${apiSettings.apiBaseUrl}/nodes/${node.id}`;
      }),
    },
  });
};

export const buildNodesSerializer = (
  apiSettings: ApiSettings,
  count: number,
  pageNumber: number,
  pageSize: number
): Serializer<Node> => {
  const pages = Math.ceil(count / pageSize);

  return new Serializer<Node>("node", {
    nullData: false,
    linkers: {
      document: new Linker(() => {
        return `${apiSettings.apiBaseUrl}/nodes?page[number]=${pageNumber}&page[size]=${pageSize}`;
      }),
      resource: new Linker((node: Node) => {
        return `${apiSettings.apiBaseUrl}/nodes/${node.id}`;
      }),
      paginator: new Paginator(() => {
        const nextPage = pageNumber + 1;
        const previousPage = pageNumber - 1;
        return {
          first: `${apiSettings.apiBaseUrl}/nodes?page[number]=${FIRST_PAGE}&page[size]=${pageSize}`,
          last: `${apiSettings.apiBaseUrl}/nodes?page[number]=${pages}&page[size]=${pageSize}`,
          next:
            nextPage <= pages
              ? `${apiSettings.apiBaseUrl}/nodes?page[number]=${nextPage}&page[size]=${pageSize}`
              : null,
          prev:
            previousPage >= 0
              ? `${apiSettings.apiBaseUrl}/nodes?page[number]=${previousPage}&page[size]=${pageSize}`
              : null,
        };
      }),
    },
    metaizers: {
      document: new Metaizer(() => ({
        itemsPerPage: pageSize,
        totalItems: count,
        currentPage: pageNumber,
        totalPages: pages,
      })),
    },
  });
};
