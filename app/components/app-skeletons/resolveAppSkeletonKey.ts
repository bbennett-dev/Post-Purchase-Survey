export type AppSkeletonKey =
  | "dashboard"
  | "surveys"
  | "templates"
  | "responses"
  | "settings"
  | "editor"
  | "default";

/**
 * Maps the current app pathname to a hydration skeleton layout.
 */
export function resolveAppSkeletonKey(pathname: string): AppSkeletonKey {
  const path = pathname.replace(/\/$/, "") || "/app";

  if (path.includes("/surveys/editor")) {
    return "editor";
  }
  if (path === "/app") {
    return "dashboard";
  }
  if (path === "/app/surveys") {
    return "surveys";
  }
  if (path.startsWith("/app/surveys/templates")) {
    return "templates";
  }
  if (path.startsWith("/app/responses")) {
    return "responses";
  }
  if (path.startsWith("/app/settings")) {
    return "settings";
  }

  return "default";
}
