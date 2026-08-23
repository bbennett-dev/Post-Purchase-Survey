import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import type { JwtPayload } from "@shopify/shopify-api";
import {
  getPublicSurvey,
  submitSurvey,
  SurveyHttpError,
} from "./survey.server";
import type { SurveySource } from "../types/survey";

interface PublicAuthResult {
  cors: (response: Response) => Response;
  sessionToken: JwtPayload;
}

type AuthenticatePublic = (request: Request) => Promise<PublicAuthResult>;

function json(data: unknown, init?: ResponseInit): Response {
  return Response.json(data, init);
}

function shopFromToken(sessionToken: JwtPayload): string {
  return sessionToken.dest;
}

export function createPublicSurveyLoader(authenticate: AuthenticatePublic) {
  return async ({ request }: LoaderFunctionArgs) => {
    const { cors, sessionToken } = await authenticate(request);
    const url = new URL(request.url);
    const shopifyOrderGid = url.searchParams.get("shopifyOrderGid");

    try {
      const payload = await getPublicSurvey({
        shop: shopFromToken(sessionToken),
        shopifyOrderGid,
      });
      return cors(json(payload));
    } catch (error) {
      if (error instanceof SurveyHttpError) {
        return cors(json({ error: error.message }, { status: error.status }));
      }
      console.error("Failed to load public survey", error);
      return cors(json({ error: "Unable to load survey." }, { status: 500 }));
    }
  };
}

export function createPublicSurveyAction(
  authenticate: AuthenticatePublic,
  defaultSource: SurveySource,
) {
  return async ({ request }: ActionFunctionArgs) => {
    const { cors, sessionToken } = await authenticate(request);

    try {
      const body = (await request.json()) as Record<string, unknown>;
      const result = await submitSurvey({
        shop: shopFromToken(sessionToken),
        sessionToken,
        body: { ...body, source: body.source ?? defaultSource },
      });
      return cors(json(result));
    } catch (error) {
      if (error instanceof SurveyHttpError) {
        return cors(json({ error: error.message }, { status: error.status }));
      }
      console.error("Failed to submit survey", error);
      return cors(json({ error: "Unable to submit survey." }, { status: 500 }));
    }
  };
}
