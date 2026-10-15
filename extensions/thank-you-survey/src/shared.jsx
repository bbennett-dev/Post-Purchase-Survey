/**
 * Public entry for Thank you + Order status targets.
 * Implementation lives under `survey/`, `components/`, and `questions/`.
 */

export { SurveyBlock } from "./survey/SurveyBlock.jsx";
export {
  firstSurvey,
  firstSurveyForChannel,
  readCheckoutConfig,
  readCheckoutSurveys,
  sortedSurveyQuestions,
} from "./survey/checkout-data.js";
