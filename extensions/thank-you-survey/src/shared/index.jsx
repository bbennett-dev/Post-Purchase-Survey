/**
 * Shared exports for block targets (survey UI + metafield readers).
 */

export { SurveyBlock } from "./survey/SurveyBlock.jsx";
export {
  firstSurvey,
  firstSurveyForChannel,
  readCheckoutConfig,
  readCheckoutSurveys,
  sortedSurveyQuestions,
} from "./survey/checkout-data.js";
