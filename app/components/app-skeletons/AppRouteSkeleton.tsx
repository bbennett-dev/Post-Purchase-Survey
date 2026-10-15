import { DashboardPageSkeleton } from "./DashboardPageSkeleton";
import { DefaultPageSkeleton } from "./DefaultPageSkeleton";
import { ResponsesPageSkeleton } from "./ResponsesPageSkeleton";
import { SettingsPageSkeleton } from "./SettingsPageSkeleton";
import { SurveyEditorPageSkeleton } from "./SurveyEditorPageSkeleton";
import { SurveysIndexPageSkeleton } from "./SurveysIndexPageSkeleton";
import { SurveysTemplatesPageSkeleton } from "./SurveysTemplatesPageSkeleton";
import { resolveAppSkeletonKey } from "./resolveAppSkeletonKey";

interface AppRouteSkeletonProps {
  pathname: string;
}

/** Route-aware hydration placeholder until the embedded app shell is stable. */
export function AppRouteSkeleton({ pathname }: AppRouteSkeletonProps) {
  const key = resolveAppSkeletonKey(pathname);

  switch (key) {
    case "dashboard":
      return <DashboardPageSkeleton />;
    case "surveys":
      return <SurveysIndexPageSkeleton />;
    case "templates":
      return <SurveysTemplatesPageSkeleton />;
    case "responses":
      return <ResponsesPageSkeleton />;
    case "settings":
      return <SettingsPageSkeleton />;
    case "editor":
      return <SurveyEditorPageSkeleton />;
    default:
      return <DefaultPageSkeleton />;
  }
}
