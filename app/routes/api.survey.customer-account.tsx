import { authenticate } from "../shopify.server";
import {
  createPublicSurveyAction,
  createPublicSurveyLoader,
} from "../lib/public-survey.server";

export const loader = createPublicSurveyLoader((request) =>
  authenticate.public.customerAccount(request),
);

export const action = createPublicSurveyAction(
  (request) => authenticate.public.customerAccount(request),
  "order_status",
);
