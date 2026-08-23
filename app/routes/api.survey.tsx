import { authenticate } from "../shopify.server";
import {
  createPublicSurveyAction,
  createPublicSurveyLoader,
} from "../lib/public-survey.server";

export const loader = createPublicSurveyLoader((request) =>
  authenticate.public.checkout(request),
);

export const action = createPublicSurveyAction(
  (request) => authenticate.public.checkout(request),
  "thank_you",
);
