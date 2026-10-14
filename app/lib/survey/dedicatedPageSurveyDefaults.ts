import type { DedicatedPageSurveyChannel } from "./types";

/** Default branding for Branded survey page (matches backend seed). */
export const DEDICATED_PAGE_SURVEY_BRANDING_DEFAULTS: Pick<
  DedicatedPageSurveyChannel,
  | "enabledHeaderLogo"
  | "enabledSideLogo"
  | "headerLogo"
  | "sideLogo"
  | "button"
  | "section"
  | "enabledSectionBackground"
  | "background"
  | "enabledCustomCss"
  | "customCss"
> = {
  enabledHeaderLogo: false,
  enabledSideLogo: false,
  headerLogo: {
    url: "",
    alignment: "center",
    enabled: true,
  },
  sideLogo: {
    url: "",
    enabled: true,
  },
  button: {
    color: "#FFFFFF",
    backgroundColor: "#1C1C1C",
    backgroundHover: "#1C1C1CE6",
  },
  section: {
    primaryTextColor: "#1C1C1C",
    secondaryTextColor: "#585858",
    accentColor: "#1C1C1C",
    backgroundColor: "#FFFFFF",
  },
  enabledSectionBackground: true,
  background: {
    type: "solid",
    colorSolid: "#FFFFFF",
    gradientStart: "#FFFFFF",
    gradientEnd: "#000000",
    gradientDirection: 70,
    image: {
      url: "",
    },
  },
  enabledCustomCss: false,
  customCss: "",
};
