import { useId, useMemo, useState } from "react";
import { BlockStack, Box, ProgressBar } from "@shopify/polaris";
import styles from "./setup-guide.module.css";

export interface SetupGuideButtonSlot {
  content: string;
  props?: Record<string, unknown>;
}

export interface SetupGuideItem {
  id: string;
  title: string;
  description: string;
  complete: boolean;
  image?: { url: string; alt: string };
  primaryButton?: SetupGuideButtonSlot;
  secondaryButton?: SetupGuideButtonSlot;
}

export interface SetupGuideProps {
  items: SetupGuideItem[];
  onDismiss: () => void;
  /** Toggle completion for a step (polariscomponents.dev contract). */
  onStepComplete: (stepId: string) => void | Promise<void>;
  /** Optional subtitle; defaults to Shopify setup guide copy. */
  subtitle?: string;
}

const outlineSvg = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10.5334 2.10692C11.0126 2.03643 11.5024 2 12 2C12.4976 2 12.9874 2.03643 13.4666 2.10692C14.013 2.18729 14.3908 2.6954 14.3104 3.2418C14.23 3.78821 13.7219 4.166 13.1755 4.08563C12.7924 4.02927 12.3999 4 12 4C11.6001 4 11.2076 4.02927 10.8245 4.08563C10.2781 4.166 9.76995 3.78821 9.68958 3.2418C9.6092 2.6954 9.987 2.18729 10.5334 2.10692ZM7.44122 4.17428C7.77056 4.61763 7.67814 5.24401 7.23479 5.57335C6.603 6.04267 6.04267 6.603 5.57335 7.23479C5.24401 7.67814 4.61763 7.77056 4.17428 7.44122C3.73094 7.11188 3.63852 6.4855 3.96785 6.04216C4.55386 5.25329 5.25329 4.55386 6.04216 3.96785C6.4855 3.63852 7.11188 3.73094 7.44122 4.17428ZM16.5588 4.17428C16.8881 3.73094 17.5145 3.63852 17.9578 3.96785C18.7467 4.55386 19.4461 5.25329 20.0321 6.04216C20.3615 6.4855 20.2691 7.11188 19.8257 7.44122C19.3824 7.77056 18.756 7.67814 18.4267 7.23479C17.9573 6.603 17.397 6.04267 16.7652 5.57335C16.3219 5.24401 16.2294 4.61763 16.5588 4.17428ZM3.2418 9.68958C3.78821 9.76995 4.166 10.2781 4.08563 10.8245C4.02927 11.2076 4 11.6001 4 12C4 12.3999 4.02927 12.7924 4.08563 13.1755C4.166 13.7219 3.78821 14.23 3.2418 14.3104C2.6954 14.3908 2.18729 14.013 2.10692 13.4666C2.03643 12.9874 2 11.5024 2 12C2 11.5024 2.03643 11.0126 2.10692 10.5334C2.18729 9.987 2.6954 9.6092 3.2418 9.68958ZM20.7582 9.68958C21.3046 9.6092 21.8127 9.987 21.8931 10.5334C21.9636 11.0126 22 11.5024 22 12C22 12.4976 21.9636 12.9874 21.8931 13.4666C21.8127 14.013 21.3046 14.3908 20.7582 14.3104C20.2118 14.23 19.834 13.7219 19.9144 13.1755C19.9707 12.7924 20 12.3999 20 12C20 11.6001 19.9707 11.2076 19.9144 10.8245C19.834 10.2781 20.2118 9.76995 20.7582 9.68958ZM4.17428 16.5588C4.61763 16.2294 5.24401 16.3219 5.57335 16.7652C6.04267 17.397 6.603 17.9573 7.23479 18.4267C7.67814 18.756 7.77056 19.3824 7.44122 19.8257C7.11188 20.2691 6.4855 20.3615 6.04216 20.0321C5.25329 19.4461 4.55386 18.7467 3.96785 17.9578C3.63852 17.5145 3.73094 16.8881 4.17428 16.5588ZM19.8257 16.5588C20.2691 16.8881 20.3615 17.5145 20.0321 17.9578C19.4461 18.7467 18.7467 19.4461 17.9578 20.0321C17.5145 20.3615 16.8881 20.2691 16.5588 19.8257C16.2294 19.3824 16.3219 18.756 16.7652 18.4267C17.397 17.9573 17.9573 17.397 18.4267 16.7652C18.756 16.3219 19.3824 16.2294 19.8257 16.5588ZM9.68958 20.7582C9.76995 20.2118 10.2781 19.834 10.8245 19.9144C11.2076 19.9707 11.6001 20 12 20C12.3999 20 12.7924 19.9707 13.1755 19.9144C13.7219 19.834 14.23 20.2118 14.3104 20.7582C14.3908 21.3046 14.013 21.8127 13.4666 21.8931C12.9874 21.9636 12.4976 22 12 22C11.5024 22 11.0126 21.9636 10.5334 21.8931C9.987 21.8127 9.6092 21.3046 9.68958 20.7582Z"
      fill="#8A8A8A"
    />
  </svg>
);

const checkSvg = (
  <svg xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 16 16" aria-hidden>
    <path
      fillRule="evenodd"
      d="M13.71 3.156a.75.75 0 0 1 .128 1.053l-6.929 8.846-.01.013c-.045.057-.104.134-.163.197a1 1 0 0 1-.382.263 1 1 0 0 1-.714-.005 1 1 0 0 1-.38-.268 6 6 0 0 1-.17-.212l-2.932-3.84a.75.75 0 1 1 1.193-.91l2.657 3.48 6.65-8.489a.75.75 0 0 1 1.052-.128"
    />
  </svg>
);

function SetupItem({
  complete,
  onComplete,
  expanded,
  setExpanded,
  title,
  description,
  image,
  primaryButton,
  secondaryButton,
  id,
}: SetupGuideItem & {
  expanded: boolean;
  setExpanded: () => void;
  onComplete: (stepId: string) => void | Promise<void>;
}) {
  const [loading, setLoading] = useState(false);

  const completeItem = async () => {
    setLoading(true);
    try {
      await onComplete(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <s-clickable borderRadius="small">
      <s-box
        borderRadius="small"
        background={expanded ? "subdued" : undefined}
        paddingBlockStart="small-400"
        paddingInline="small-300"
        paddingBlockEnd="small-400"
      >
        <s-grid gridTemplateColumns="auto 1fr" alignItems="start" columnGap="small">
          <s-grid-item>
            <s-tooltip id={`complete-tooltip-${id}`}>
              {complete ? "Mark as not done" : "Mark as done"}
            </s-tooltip>
            <s-clickable onClick={() => void completeItem()} interestFor={`complete-tooltip-${id}`}>
              <div className={styles.completeButton}>
                {loading ? (
                  <s-spinner size="base" />
                ) : complete ? (
                  <div
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      borderRadius: "100%",
                      background: "#303030",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fill: "#fff",
                      color: "#fff",
                    }}
                  >
                    {checkSvg}
                  </div>
                ) : (
                  outlineSvg
                )}
              </div>
            </s-clickable>
          </s-grid-item>
          <s-grid-item>
            <div
              className={styles.itemContent}
              onClick={expanded ? undefined : setExpanded}
              onKeyDown={
                expanded
                  ? undefined
                  : (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setExpanded();
                      }
                    }
              }
              role={expanded ? undefined : "button"}
              tabIndex={expanded ? undefined : 0}
              style={{
                cursor: expanded ? "default" : "pointer",
                paddingBlockStart: "2px",
              }}
            >
              <div className={styles.itemContentMain}>
                <s-stack direction="block" gap="none">
                  {expanded ? <s-heading>{title}</s-heading> : <s-text>{title}</s-text>}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: expanded ? "1fr" : "0fr",
                      transition: "grid-template-rows 0.1s ease-out",
                    }}
                  >
                    <div style={{ overflow: "hidden" }}>
                      <s-box paddingBlockStart="small" paddingBlockEnd="small">
                        <s-stack direction="block" gap="large">
                          <s-text>{description}</s-text>
                          {primaryButton || secondaryButton ? (
                            <s-stack direction="inline" gap="base">
                              {primaryButton ? (
                                <s-button variant="primary" {...primaryButton.props}>
                                  {primaryButton.content}
                                </s-button>
                              ) : null}
                              {secondaryButton ? (
                                <s-button variant="tertiary" {...secondaryButton.props}>
                                  {secondaryButton.content}
                                </s-button>
                              ) : null}
                            </s-stack>
                          ) : null}
                        </s-stack>
                      </s-box>
                    </div>
                  </div>
                </s-stack>
              </div>
              {image && expanded ? (
                <img
                  className={styles.itemImage}
                  src={image.url}
                  alt={image.alt}
                  style={{ maxHeight: "7.75rem" }}
                />
              ) : null}
            </div>
          </s-grid-item>
        </s-grid>
      </s-box>
    </s-clickable>
  );
}

/**
 * [Polaris Setup Guide](https://www.polariscomponents.dev/components/setup-guide) (App Home web components).
 */
export function SetupGuide({
  items,
  onDismiss,
  onStepComplete,
  subtitle = "Use this personalized guide to get your app up and running.",
}: SetupGuideProps) {
  const firstIncompleteId =
    items.find((item) => !item.complete)?.id ?? items[0]?.id ?? "";
  const [expandedId, setExpandedId] = useState(firstIncompleteId);
  const [isGuideOpen, setIsGuideOpen] = useState(true);
  const accessId = useId();
  const completedItemsLength = items.filter((item) => item.complete).length;
  const allComplete =
    items.length > 0 && completedItemsLength === items.length;
  const progressPercent = useMemo(() => {
    if (items.length === 0) {
      return 0;
    }
    return Math.round((completedItemsLength / items.length) * 100);
  }, [completedItemsLength, items.length]);

  return (
    // App Home WC: matches polariscomponents.dev Setup Guide layout (s-section / s-menu).
    <s-section padding="none">
      <s-box padding="base" paddingBlockEnd="none">
        <s-stack direction="block" gap="none">
          <s-stack direction="inline" justifyContent="space-between" alignItems="center">
            <s-heading>Setup Guide</s-heading>
            <s-stack direction="inline" gap="small-300">
              <s-button
                commandFor="setup-guide-menu"
                variant="tertiary"
                icon="menu-horizontal"
              />
              <s-menu id="setup-guide-menu" accessibilityLabel="Setup guide options">
                <s-button onClick={onDismiss}>
                  <s-stack direction="inline" gap="small" alignItems="center">
                    <div
                      style={{
                        height: "1rem",
                        width: "1rem",
                        paddingTop: ".05rem",
                      }}
                    >
                      <s-icon type="x" tone="neutral" />
                    </div>
                    <span>Dismiss</span>
                  </s-stack>
                </s-button>
              </s-menu>

              <s-button
                variant="tertiary"
                icon={isGuideOpen ? "chevron-up" : "chevron-down"}
                onClick={() => {
                  setIsGuideOpen((prev) => {
                    if (!prev) {
                      const nextId =
                        items.find((item) => !item.complete)?.id ?? items[0]?.id;
                      if (nextId) {
                        setExpandedId(nextId);
                      }
                    }
                    return !prev;
                  });
                }}
              />
            </s-stack>
          </s-stack>
          <s-text>{subtitle}</s-text>
          <div
            className={styles.progressSection}
            style={{
              marginTop: ".8rem",
              paddingBlockEnd: !isGuideOpen ? "0.75rem" : undefined,
            }}
          >
            {/* React Polaris: BlockStack gap is reliable inside App Home WC shell. */}
            <BlockStack gap="400">
              <Box  width="100%">
                <div className={styles.progressBarWrap}>
                  <ProgressBar
                    progress={progressPercent}
                    size="small"
                    tone={allComplete ? "success" : "highlight"}
                  />
                </div>
              </Box>
              <div className={styles.progressMeta}>
                {allComplete ? (
                  <span className={styles.completeBadge}>
                    <span className={styles.completeBadgeIcon} aria-hidden>
                      {checkSvg}
                    </span>
                    <span className={styles.completeBadgeLabel}>
                      All steps complete
                    </span>
                  </span>
                ) : (
                  <span className={styles.progressCount}>
                    {`${completedItemsLength} / ${items.length} completed`}
                  </span>
                )}
              </div>
            </BlockStack>
          </div>
        </s-stack>
      </s-box>
      <div
        style={{
          display: "grid",
          gridTemplateRows: isGuideOpen ? "1fr" : "0fr",
          transition: "grid-template-rows 0.1s ease-out",
          paddingBlockStart: isGuideOpen ? "20px" : "0px",
        }}
        id={accessId}
      >
        <div style={{ overflow: "hidden" }}>
          <s-box padding="small-300">
            <s-stack direction="block" gap="small-400">
              {items.map((item) => (
                <SetupItem
                  key={item.id}
                  expanded={expandedId === item.id}
                  setExpanded={() => setExpandedId(item.id)}
                  onComplete={onStepComplete}
                  {...item}
                />
              ))}
            </s-stack>
          </s-box>
        </div>
      </div>
      {allComplete ? (
        <div
          style={{
            borderBlockStart: "1px solid var(--p-color-border-secondary)",
          }}
        >
          <s-box background="subdued" padding="base">
            <s-stack direction="inline" justifyContent="space-between" alignItems="center">
              <s-text color="subdued">
                You&apos;re ready to collect post-purchase attribution.
              </s-text>
              <s-button onClick={onDismiss}>Dismiss Guide</s-button>
            </s-stack>
          </s-box>
        </div>
      ) : null}
    </s-section>
  );
}
