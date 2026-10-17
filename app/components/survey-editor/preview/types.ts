import type {
  PostPurchasePageChannel,
  PreviewDevice,
  SurveyQuestion,
  ThankYouContent,
} from "../../../lib/survey/types";

/** Channel keys that have a dedicated editor preview implementation. */
export type EditorPreviewChannelKey = string;

/** Left-panel selection mirrored in the center preview. */
export type EditorPreviewSelection =
  | { type: "question"; questionId: string }
  | { type: "ending"; endingId: string | null };

export type EditorPreviewNavigateTarget = EditorPreviewSelection;

export interface EditorPreviewFrameProps {
  questions: SurveyQuestion[];
  thankYou: ThankYouContent;
  device: PreviewDevice;
  storeLabel: string;
  selection: EditorPreviewSelection;
  onRestartDemo: () => void;
  onPreviewNavigate?: (target: EditorPreviewNavigateTarget) => void;
  /** Post-purchase channel settings (display type, announcement bar, side logo). */
  postPurchaseChannel?: PostPurchasePageChannel;
}
