import type { ReactNode } from "react";
import type { ChannelDefinition } from "../../../../lib/survey/channels";

interface ChannelRowProps {
  definition: ChannelDefinition;
  enabled: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onEnabledChange: (enabled: boolean) => void;
  children?: ReactNode;
}

/**
 * Accordion channel row. Core settings render in the expanded left body;
 * advanced settings for the selected channel render in the right panel.
 */
export function ChannelRow({
  definition,
  enabled,
  expanded,
  onToggleExpand,
  onEnabledChange,
  children,
}: ChannelRowProps) {
  const hasToggle = definition.hasToggle !== false;

  const outerCols = [
    "minmax(0, 1fr)",
    definition.recommended ? "auto" : null,
    hasToggle ? "auto" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <s-box border="base" borderRadius="base" overflow="hidden">
      <s-box
        paddingBlock="small-200"
        paddingInline="small-200"
        background={expanded ? "subdued" : "base"}
      >
        <s-grid
          gridTemplateColumns={outerCols}
          gap="small-200"
          alignItems="center"
        >
          <s-clickable
            padding="none"
            borderRadius="base"
            accessibilityLabel={
              expanded
                ? `Collapse ${definition.label}`
                : `Expand ${definition.label}`
            }
            onClick={onToggleExpand}
          >
            <s-grid
              gridTemplateColumns="auto auto minmax(0, 1fr)"
              gap="small-200"
              alignItems="center"
            >
              <s-icon
                type={expanded ? "chevron-up" : "chevron-down"}
                color="subdued"
              />
              <s-icon
                type={definition.icon}
                color={enabled ? undefined : "subdued"}
              />
              <s-text type={enabled ? "strong" : undefined}>
                {definition.label}
              </s-text>
            </s-grid>
          </s-clickable>

          {definition.recommended ? (
            <s-icon type="star-filled" tone="info" />
          ) : null}

          {hasToggle ? (
            <s-switch
              label={`Enable ${definition.label}`}
              labelAccessibilityVisibility="exclusive"
              checked={enabled}
              onChange={(event) => {
                onEnabledChange(
                  Boolean(
                    (event.currentTarget as HTMLElement & { checked?: boolean })
                      .checked,
                  ),
                );
              }}
            />
          ) : null}
        </s-grid>
      </s-box>

      {expanded ? (
        <>
          <s-divider direction="inline" color="base" />
          <s-box padding="small" background="subdued">
            {children}
          </s-box>
        </>
      ) : null}
    </s-box>
  );
}
