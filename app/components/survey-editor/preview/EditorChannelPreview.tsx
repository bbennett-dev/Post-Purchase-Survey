import type { EditorPreviewFrameProps } from "./types";
import { ThankYouChannelPreview } from "./channels/thank-you/ThankYouChannelPreview";
import { UnsupportedChannelPreview } from "./channels/UnsupportedChannelPreview";

const THANK_YOU_CHANNEL_KEY = "postPurchasePage";

interface EditorChannelPreviewProps extends EditorPreviewFrameProps {
  channelKey: string;
}

/**
 * Routes editor canvas preview by survey channel + device.
 * Add new channel folders under `preview/channels/` and register here.
 */
export function EditorChannelPreview({
  channelKey,
  ...frame
}: EditorChannelPreviewProps) {
  if (channelKey === THANK_YOU_CHANNEL_KEY) {
    return <ThankYouChannelPreview {...frame} />;
  }

  return (
    <UnsupportedChannelPreview channelKey={channelKey} {...frame} />
  );
}
