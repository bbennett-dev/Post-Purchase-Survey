import type { SVGProps } from "react";

/**
 * Selected radio control (ring + dot). `@shopify/polaris-icons` has no radio icon;
 * `SelectIcon` is chevrons — this matches competitor / Polaris RadioButton affordance.
 */
export function SingleChoiceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 20 20" {...props}>
      <path
        fillRule="evenodd"
        d="M10 3.25a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5Zm0 1.5a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5Z"
      />
      <path d="M10 8.25a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5Z" />
    </svg>
  );
}
