import {
  DbClient,
  OrganizationParticipantRef,
  organizationParticipantRefsBroker,
  organizationsBroker,
  participantsBroker,
} from "@xilution/todd-coin-brokers";
import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Boom from "@hapi/boom";
import { ValidationError, ValidationErrorItem } from "joi";
import { DEFAULT_PAGE_SIZE, FIRST_PAGE } from "@xilution/todd-coin-constants";
import { ApiData, ApiSettings } from "../types";
import { Organization, Participant } from "@xilution/todd-coin-types";
import {
  buildBadRequestError,
  buildInvalidAttributeError,
  buildInvalidParameterError,
  buildInvalidQueryError,
  buildNofFountError,
} from "./error-utils";
import {
  serializeOrganization,
  serializeOrganizations,
} from "../serializers/organization-serializers";
import { serializeParticipants } from "../serializers/participants-serializers";
import { return403, return404, return500 } from "./response-utils";

export const getOrganizationsValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) =>
        buildInvalidQueryError(errorItem)
      ),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const getOrganizationValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) =>
        buildInvalidParameterError(errorItem)
      ),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const deleteOrganizationParticipantValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) =>
        buildInvalidParameterError(errorItem)
      ),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const postOrganizationValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) =>
        buildInvalidAttributeError(errorItem)
      ),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const patchOrganizationValidationFailAction = (
  request: Request,
  h: ResponseToolkit,
  error: Error | undefined
) => {
  const validationError = error as Boom.Boom & ValidationError;

  return h
    .response({
      jsonapi: { version: "1.0" },
      errors: validationError?.details.map((errorItem: ValidationErrorItem) => {
        if (errorItem.context?.key === "organizationId") {
          return buildInvalidParameterError(errorItem);
        }
        return buildInvalidQueryError(errorItem);
      }),
    })
    .code(validationError?.output.statusCode || 400)
    .takeover();
};

export const getOrganizationsRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let response: { count: number; rows: Organization[] } | undefined;
    try {
      response = await organizationsBroker.getOrganizations(
        dbClient,
        pageNumber,
        pageSize
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const { count, rows } = response;

    return h
      .response(
        serializeOrganizations(apiSettings, count, pageNumber, pageSize, rows)
      )
      .code(200);
  };

export const getOrganizationRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { organizationId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A organization with id: ${organizationId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    return h
      .response(serializeOrganization(apiSettings, organization))
      .code(200);
  };

export const postOrganizationRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Organization> };

    const newOrganization = {
      id: payload.data.id,
      ...payload.data.attributes,
    } as Organization;

    let getOrganizationsResponse: { count: number };
    try {
      getOrganizationsResponse = await organizationsBroker.getOrganizations(
        dbClient,
        FIRST_PAGE,
        DEFAULT_PAGE_SIZE,
        {
          name: newOrganization.name,
        }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (getOrganizationsResponse.count !== 0) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `Another organization is already using the name: ${newOrganization.name}.`
            ),
          ],
        })
        .code(400);
    }

    let createdOrganization: Organization;
    try {
      createdOrganization = (await organizationsBroker.createOrganization(
        dbClient,
        newOrganization
      )) as Organization;
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    try {
      createdOrganization = (await organizationsBroker.getOrganizationById(
        dbClient,
        createdOrganization.id as string
      )) as Organization;
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    // todo - notify known organizations that a new organization was added

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "create-organization",
        result: "success",
        details: {
          is: createdOrganization,
        },
      })
    );

    return h
      .response(serializeOrganization(apiSettings, createdOrganization))
      .header(
        "location",
        `${apiSettings.apiBaseUrl}/organizations/${createdOrganization?.id}`
      )
      .code(201);
  };

export const patchOrganizationRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { organizationId } = request.params;
    const payload = request.payload as { data: ApiData<Organization> };

    if (payload.data.id !== organizationId) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildBadRequestError(
              `The path organization ID does not match the request body organization ID.`
            ),
          ],
        })
        .code(400);
    }

    let existingOrganization: Organization | undefined;
    try {
      existingOrganization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (existingOrganization === undefined) {
      return h
        .response({
          jsonapi: { version: "1.0" },
          errors: [
            buildNofFountError(
              `A organization with id: ${organizationId} was not found.`
            ),
          ],
        })
        .code(404);
    }

    const updatedOrganization: Organization = {
      id: organizationId,
      ...payload.data.attributes,
    } as Organization;

    const authParticipant = request.auth.credentials.participant as Participant;

    let something: { count: number };
    try {
      something =
        await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
          dbClient,
          0,
          DEFAULT_PAGE_SIZE,
          {
            organizationId,
            participantId: authParticipant.id,
            isAdministrator: true,
          }
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (something.count === 0) {
      return return403(
        h,
        `You are not authorized to update this organization. You must be an organization administrator.`
      );
    }

    try {
      await organizationsBroker.updateOrganization(
        dbClient,
        updatedOrganization
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    console.log(
      JSON.stringify({
        date: new Date().toISOString(),
        authParticipantEmail: authParticipant.email,
        authParticipantId: authParticipant.id,
        action: "update-organization",
        result: "success",
        details: {
          before: existingOrganization,
          after: updatedOrganization,
        },
      })
    );

    return h.response().code(204);
  };

export const deleteOrganizationParticipantRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { organizationId, participantId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    let participant: Participant | undefined;
    try {
      participant = await participantsBroker.getParticipantById(
        dbClient,
        participantId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (participant === undefined) {
      return return404(
        h,
        `A participant with id: ${participantId} was not found.`
      );
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    // todo - validate that that the auth user can do this. probably should be an org administrator.

    try {
      const { rows } =
        await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
          dbClient,
          0,
          DEFAULT_PAGE_SIZE,
          {
            organizationId: organization?.id,
            participantId: participant?.id,
          }
        );

      await Promise.all(
        rows.map(
          async (organizationParticipantRef: OrganizationParticipantRef) => {
            await organizationParticipantRefsBroker.deleteOrganizationParticipantRef(
              dbClient,
              organizationParticipantRef
            );

            console.log(
              JSON.stringify({
                date: new Date().toISOString(),
                authParticipantEmail: authParticipant.email,
                authParticipantId: authParticipant.id,
                action: "delete-organization-authorized-signer-reference",
                result: "success",
                details: {
                  was: organizationParticipantRef,
                },
              })
            );
          }
        )
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return h.response().code(204);
  };

export const deleteOrganizationAuthorizedSignerRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { organizationId, authorizedSignerId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    let participant: Participant | undefined;
    try {
      participant = await participantsBroker.getParticipantById(
        dbClient,
        authorizedSignerId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (participant === undefined) {
      return return404(
        h,
        `A participant with id: ${authorizedSignerId} was not found.`
      );
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    // todo - validate that that the auth user can do this. probably should be an org administrator.

    try {
      const { rows } =
        await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
          dbClient,
          0,
          DEFAULT_PAGE_SIZE,
          {
            organizationId: organization?.id,
            participantId: participant?.id,
          }
        );

      await Promise.all(
        rows.map(
          async (organizationParticipantRef: OrganizationParticipantRef) => {
            await organizationParticipantRefsBroker.updateOrganizationParticipantRef(
              dbClient,
              { ...organizationParticipantRef, isAuthorizedSigner: false }
            );

            console.log(
              JSON.stringify({
                date: new Date().toISOString(),
                authParticipantEmail: authParticipant.email,
                authParticipantId: authParticipant.id,
                action: "delete-organization-authorized-signer-reference",
                result: "success",
                details: {
                  was: organizationParticipantRef,
                },
              })
            );
          }
        )
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return h.response().code(204);
  };

export const deleteOrganizationAdministratorRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const { organizationId, administratorId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    let participant: Participant | undefined;
    try {
      participant = await participantsBroker.getParticipantById(
        dbClient,
        administratorId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (participant === undefined) {
      return return404(
        h,
        `A participant with id: ${administratorId} was not found.`
      );
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    // todo - validate that that the auth user can do this. probably should be an org administrator.

    try {
      const { rows } =
        await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
          dbClient,
          0,
          DEFAULT_PAGE_SIZE,
          {
            organizationId: organization?.id,
            participantId: participant?.id,
          }
        );

      await Promise.all(
        rows.map(
          async (organizationParticipantRef: OrganizationParticipantRef) => {
            await organizationParticipantRefsBroker.updateOrganizationParticipantRef(
              dbClient,
              { ...organizationParticipantRef, isAdministrator: false }
            );

            console.log(
              JSON.stringify({
                date: new Date().toISOString(),
                authParticipantEmail: authParticipant.email,
                authParticipantId: authParticipant.id,
                action: "delete-organization-authorized-signer-reference",
                result: "success",
                details: {
                  was: organizationParticipantRef,
                },
              })
            );
          }
        )
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return h.response().code(204);
  };

export const getOrganizationParticipantRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { organizationId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let getOrganizationParticipantRefsResponse: {
      count: number;
      rows: OrganizationParticipantRef[];
    };
    try {
      getOrganizationParticipantRefsResponse =
        await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
          dbClient,
          0,
          DEFAULT_PAGE_SIZE,
          {
            organizationId,
          }
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const participantIds = getOrganizationParticipantRefsResponse.rows.map(
      (organizationParticipantRef: OrganizationParticipantRef) =>
        organizationParticipantRef.participantId
    );

    let getParticipantsResponse: { count: number; rows: Participant[] };
    try {
      getParticipantsResponse = await participantsBroker.getParticipants(
        dbClient,
        pageNumber,
        pageSize,
        { ids: participantIds }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return serializeParticipants(
      apiSettings,
      getParticipantsResponse.count,
      pageNumber,
      pageSize,
      getParticipantsResponse.rows
    );
  };

export const getOrganizationAuthorizedSignerRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { organizationId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let getOrganizationParticipantRefsResponse: {
      count: number;
      rows: OrganizationParticipantRef[];
    };
    try {
      getOrganizationParticipantRefsResponse =
        await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
          dbClient,
          0,
          DEFAULT_PAGE_SIZE,
          {
            organizationId,
            isAuthorizedSigner: true,
          }
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const participantIds = getOrganizationParticipantRefsResponse.rows.map(
      (organizationParticipantRef: OrganizationParticipantRef) =>
        organizationParticipantRef.participantId
    );

    let getParticipantsResponse: { count: number; rows: Participant[] };
    try {
      getParticipantsResponse = await participantsBroker.getParticipants(
        dbClient,
        pageNumber,
        pageSize,
        { ids: participantIds }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return serializeParticipants(
      apiSettings,
      getParticipantsResponse.count,
      pageNumber,
      pageSize,
      getParticipantsResponse.rows
    );
  };

export const getOrganizationAdministratorRequestHandler =
  (dbClient: DbClient, apiSettings: ApiSettings) =>
  async (request: Request, h: ResponseToolkit) => {
    const { organizationId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    const pageNumber: number =
      Number(request.query["page[number]"]) || FIRST_PAGE;

    const pageSize: number =
      Number(request.query["page[size]"]) || DEFAULT_PAGE_SIZE;

    let getOrganizationParticipantRefsResponse: {
      count: number;
      rows: OrganizationParticipantRef[];
    };
    try {
      getOrganizationParticipantRefsResponse =
        await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
          dbClient,
          0,
          DEFAULT_PAGE_SIZE,
          {
            organizationId,
            isAdministrator: true,
          }
        );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    const participantIds = getOrganizationParticipantRefsResponse.rows.map(
      (organizationParticipantRef: OrganizationParticipantRef) =>
        organizationParticipantRef.participantId
    );

    let getParticipantsResponse: { count: number; rows: Participant[] };
    try {
      getParticipantsResponse = await participantsBroker.getParticipants(
        dbClient,
        pageNumber,
        pageSize,
        { ids: participantIds }
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return serializeParticipants(
      apiSettings,
      getParticipantsResponse.count,
      pageNumber,
      pageSize,
      getParticipantsResponse.rows
    );
  };

export const postOrganizationParticipantsRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Participant>[] };
    const { organizationId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    // todo - somehow use the organization domains to determine who can be added to the organization

    const participantIds = payload.data.map(
      (apiData: ApiData<Participant>) => apiData.id
    );

    const participants: (Participant | undefined)[] = await Promise.all(
      participantIds.map(
        async (id: string) =>
          await participantsBroker.getParticipantById(dbClient, id, true)
      )
    );

    if (
      participants.some(
        (participant: Participant | undefined) => participant === undefined
      )
    ) {
      return return404(h, `Some of the participants were not found.`);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    try {
      await Promise.all(
        participantIds.map(async (participantId: string) => {
          const { rows } =
            await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
              dbClient,
              0,
              DEFAULT_PAGE_SIZE,
              {
                organizationId,
                participantId,
              }
            );

          if (rows.length === 0) {
            const organizationParticipantRef:
              | OrganizationParticipantRef
              | undefined = await organizationParticipantRefsBroker.createOrganizationParticipantRef(
              dbClient,
              {
                organizationId,
                participantId,
                isAuthorizedSigner: false,
                isAdministrator: false,
              }
            );

            console.log(
              JSON.stringify({
                date: new Date().toISOString(),
                authParticipantEmail: authParticipant.email,
                authParticipantId: authParticipant.id,
                action: "create-organization-participant-reference",
                result: "success",
                details: {
                  is: organizationParticipantRef,
                },
              })
            );
          }
        })
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return h.response().code(204);
  };

export const postOrganizationAuthorizedSignersRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Participant>[] };
    const { organizationId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    const participantIds = payload.data.map(
      (apiData: ApiData<Participant>) => apiData.id
    );

    const participants: (Participant | undefined)[] = await Promise.all(
      participantIds.map(
        async (id: string) =>
          await participantsBroker.getParticipantById(dbClient, id, true)
      )
    );

    if (
      participants.some(
        (participant: Participant | undefined) => participant === undefined
      )
    ) {
      return return404(h, `Some of the participants were not found.`);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    // todo - validate that that the auth user can do this. probably should be an org administrator.

    try {
      await Promise.all(
        participantIds.map(async (participantId: string) => {
          const { rows } =
            await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
              dbClient,
              0,
              DEFAULT_PAGE_SIZE,
              {
                organizationId,
                participantId,
              }
            );

          if (rows.length === 0) {
            const organizationParticipantRef:
              | OrganizationParticipantRef
              | undefined = await organizationParticipantRefsBroker.createOrganizationParticipantRef(
              dbClient,
              {
                organizationId,
                participantId,
                isAdministrator: false,
                isAuthorizedSigner: true,
              }
            );

            console.log(
              JSON.stringify({
                date: new Date().toISOString(),
                authParticipantEmail: authParticipant.email,
                authParticipantId: authParticipant.id,
                action: "create-organization-authorized-signer-reference",
                result: "success",
                details: {
                  is: organizationParticipantRef,
                },
              })
            );
          } else {
            await Promise.all(
              rows.map(
                async (
                  organizationParticipantRef: OrganizationParticipantRef
                ) => {
                  const updatedOrganizationParticipantRef = {
                    ...organizationParticipantRef,
                    isAuthorizedSigner: true,
                  };
                  await organizationParticipantRefsBroker.updateOrganizationParticipantRef(
                    dbClient,
                    updatedOrganizationParticipantRef
                  );

                  console.log(
                    JSON.stringify({
                      date: new Date().toISOString(),
                      authParticipantEmail: authParticipant.email,
                      authParticipantId: authParticipant.id,
                      action: "update-organization-authorized-signer-reference",
                      result: "success",
                      details: {
                        was: organizationParticipantRef,
                        is: updatedOrganizationParticipantRef,
                      },
                    })
                  );

                  return;
                }
              )
            );
          }
        })
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return h.response().code(204);
  };

export const postOrganizationAdministratorsRequestHandler =
  (dbClient: DbClient) => async (request: Request, h: ResponseToolkit) => {
    const payload = request.payload as { data: ApiData<Participant>[] };
    const { organizationId } = request.params;

    let organization: Organization | undefined;
    try {
      organization = await organizationsBroker.getOrganizationById(
        dbClient,
        organizationId
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    if (organization === undefined) {
      return return404(
        h,
        `A organization with id: ${organizationId} was not found.`
      );
    }

    const participantIds = payload.data.map(
      (apiData: ApiData<Participant>) => apiData.id
    );

    const participants: (Participant | undefined)[] = await Promise.all(
      participantIds.map(
        async (id: string) =>
          await participantsBroker.getParticipantById(dbClient, id, true)
      )
    );

    if (
      participants.some(
        (participant: Participant | undefined) => participant === undefined
      )
    ) {
      return return404(h, `Some of the participants were not found.`);
    }

    const authParticipant = request.auth.credentials.participant as Participant;

    // todo - validate that that the auth user can do this. probably should be an org administrator.

    try {
      await Promise.all(
        participantIds.map(async (participantId: string) => {
          const { rows } =
            await organizationParticipantRefsBroker.getOrganizationParticipantRefs(
              dbClient,
              0,
              DEFAULT_PAGE_SIZE,
              {
                organizationId,
                participantId,
              }
            );

          if (rows.length === 0) {
            const organizationParticipantRef:
              | OrganizationParticipantRef
              | undefined = await organizationParticipantRefsBroker.createOrganizationParticipantRef(
              dbClient,
              {
                organizationId,
                participantId,
                isAdministrator: true,
                isAuthorizedSigner: false,
              }
            );

            console.log(
              JSON.stringify({
                date: new Date().toISOString(),
                authParticipantEmail: authParticipant.email,
                authParticipantId: authParticipant.id,
                action: "create-organization-authorized-signer-reference",
                result: "success",
                details: {
                  is: organizationParticipantRef,
                },
              })
            );
          } else {
            await Promise.all(
              rows.map(
                async (
                  organizationParticipantRef: OrganizationParticipantRef
                ) => {
                  const updatedOrganizationParticipantRef = {
                    ...organizationParticipantRef,
                    isAdministrator: true,
                  };
                  await organizationParticipantRefsBroker.updateOrganizationParticipantRef(
                    dbClient,
                    updatedOrganizationParticipantRef
                  );

                  console.log(
                    JSON.stringify({
                      date: new Date().toISOString(),
                      authParticipantEmail: authParticipant.email,
                      authParticipantId: authParticipant.id,
                      action: "update-organization-authorized-signer-reference",
                      result: "success",
                      details: {
                        was: organizationParticipantRef,
                        is: updatedOrganizationParticipantRef,
                      },
                    })
                  );

                  return;
                }
              )
            );
          }
        })
      );
    } catch (error) {
      console.error((error as Error).message);
      return return500(h);
    }

    return h.response().code(204);
  };
