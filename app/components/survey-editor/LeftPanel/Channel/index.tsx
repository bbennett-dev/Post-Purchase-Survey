import { CHANNEL_LABELS } from "../../../../lib/survey/questions";
import type { SurveyDocument } from "../../../../lib/survey/types";

interface ChannelPanelProps {
  survey: SurveyDocument;
}

/**
 * Channel tab summary. Full channel editing is a follow-up feature.
 */
export function ChannelPanel({ survey }: ChannelPanelProps) {
  return (
    <s-stack gap="small-200">
      <s-paragraph color="subdued">
        Channels are stored on the survey. Editing them comes next.
      </s-paragraph>
      {Object.keys(survey.channels).map((name) => (
        <s-stack
          key={name}
          direction="inline"
          gap="small-200"
          alignItems="center"
        >
          <s-text>{CHANNEL_LABELS[name] ?? name}</s-text>
          <s-badge
            tone={survey.channels[name]?.enabled ? "success" : "warning"}
          >
            {survey.channels[name]?.enabled ? "On" : "Off"}
          </s-badge>
        </s-stack>
      ))}
    </s-stack>
  );
}
