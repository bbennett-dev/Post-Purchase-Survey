import { useCallback, useMemo, useState } from "react";
import type {
  PostPurchasePageChannel,
  PreviewDevice,
  SurveyQuestion,
  ThankYouContent,
} from "../../lib/survey/types";
import { EditorFillBox } from "./EditorFlexLayout";
import { EditorChannelPreview } from "./preview/EditorChannelPreview";
import type { EditorPreviewNavigateTarget, EditorPreviewSelection } from "./preview/types";

interface EditorPreviewProps {
  channelKey: string;
  questions: SurveyQuestion[];
  thankYou: ThankYouContent;
  device: PreviewDevice;
  shopLabel: string;
  selection: EditorPreviewSelection;
  onPreviewNavigate: (target: EditorPreviewNavigateTarget) => void;
  postPurchaseChannel?: PostPurchasePageChannel;
}

/**
 * Center canvas — channel-specific checkout / storefront preview.
 */
export function EditorPreview({
  channelKey,
  questions,
  thankYou,
  device,
  shopLabel,
  selection,
  onPreviewNavigate,
  postPurchaseChannel,
}: EditorPreviewProps) {
  const [demoGeneration, setDemoGeneration] = useState(0);
  const onRestartDemo = useCallback(() => {
    setDemoGeneration((n) => n + 1);
  }, []);

  const isFullscreen = device === "fullscreen";

  const previewQuestions = useMemo(() => questions, [questions]);

  return (
    <EditorFillBox>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          minHeight: 0,
          overflow: "hidden",
          borderRadius: isFullscreen ? 0 : "var(--p-border-radius-200)",
        }}
      >
        <EditorChannelPreview
          key={`${channelKey}-${device}-${demoGeneration}`}
          channelKey={channelKey}
          questions={previewQuestions}
          thankYou={thankYou}
          device={device}
          storeLabel={shopLabel}
          selection={selection}
          onRestartDemo={onRestartDemo}
          onPreviewNavigate={onPreviewNavigate}
          postPurchaseChannel={postPurchaseChannel}
        />
      </div>
    </EditorFillBox>
  );
}
