import { Box } from "@shopify/polaris";
import { PreviewDemoFooter } from "../../PreviewDemoFooter";
import { PreviewScrollShell } from "../../PreviewScrollShell";
import type { EditorPreviewFrameProps } from "../../types";
import { useInteractiveSurveyPreview } from "../../useInteractiveSurveyPreview";
import { ThankYouCheckoutBody } from "./ThankYouCheckoutBody";

/**
 * Thank you + order status channel preview (`postPurchasePage`).
 */
export function ThankYouChannelPreview(props: EditorPreviewFrameProps) {
  const surveyFlow = useInteractiveSurveyPreview(
    props.questions,
    props.thankYou,
    props.selection,
    props.onPreviewNavigate,
  );

  const layout =
    props.device === "fullscreen"
      ? "fullscreen"
      : props.device === "desktop"
        ? "desktop"
        : "mobile";

  const isFullscreen = props.device === "fullscreen";

  return (
    <PreviewScrollShell
      footer={
        <Box padding="400">
          <PreviewDemoFooter
            onRestartDemo={() => {
              surveyFlow.reset();
              props.onRestartDemo();
            }}
          />
        </Box>
      }
    >
      <Box
        padding={isFullscreen ? "300" : "400"}
        paddingBlockStart={isFullscreen ? "200" : "400"}
      >
        <div
          style={{
            maxWidth: isFullscreen
              ? "100%"
              : layout === "mobile"
                ? "375px"
                : "100%",
            width: "100%",
            marginInline: "auto",
          }}
        >
          <Box
            borderWidth="025"
            borderColor="border"
            borderRadius={isFullscreen ? "0" : "200"}
            overflowX="hidden"
            overflowY="hidden"
            background="bg-surface"
            shadow={isFullscreen ? undefined : "200"}
          >
            <ThankYouCheckoutBody
              {...props}
              layout={layout}
              surveyFlow={surveyFlow}
            />
          </Box>
        </div>
      </Box>
    </PreviewScrollShell>
  );
}
