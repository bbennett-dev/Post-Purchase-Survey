import { useOutletContext, useRouteLoaderData } from "react-router";
import type { ResponsesRouteLoaderData } from "./responses-route";

const EMPTY: ResponsesRouteLoaderData = {
  responses: [],
  total: 0,
  surveyFilter: null,
  view: "active",
};

/** Parent list loader data for index + detail (outlet context or route loader). */
export function useResponsesRouteData(): ResponsesRouteLoaderData {
  const fromOutlet = useOutletContext<ResponsesRouteLoaderData | undefined>();
  const fromLoader = useRouteLoaderData("routes/app.responses") as
    | ResponsesRouteLoaderData
    | undefined;
  return fromOutlet ?? fromLoader ?? EMPTY;
}
