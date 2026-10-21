import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";
import { Link } from "react-router";
import type { AppProviderProps } from "@shopify/polaris";

const ABSOLUTE_URL = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

type AnchorTarget = "_blank" | "_self" | "_parent" | "_top";

type PolarisLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "target"
> & {
  url: string;
  external?: boolean;
  target?: AnchorTarget;
  children?: ReactNode;
};

type PolarisLinkComponent = NonNullable<AppProviderProps["linkComponent"]>;

/**
 * Polaris `Button` / `Link` `url` renders a native `<a>`. App Bridge only
 * client-routes `s-link` and `s-button` (`shopify:navigate`). A document load of
 * `/app/...` has no `shop` or `host`, so `authenticate.admin` returns an empty
 * App Bridge shell and the admin iframe goes white. Internal urls stay on the
 * React Router history stack, which already carries the session token.
 */
const PolarisRouterLinkBase = forwardRef<HTMLAnchorElement, PolarisLinkProps>(
  function PolarisRouterLink(
    { url, external, target, rel, children, download, ...rest },
    ref,
  ) {
    const resolvedTarget: AnchorTarget | undefined = external
      ? "_blank"
      : target;
    const leavesTheApp =
      Boolean(external) ||
      download != null ||
      ABSOLUTE_URL.test(url) ||
      (resolvedTarget != null && resolvedTarget !== "_self");

    if (leavesTheApp) {
      return (
        <a
          {...rest}
          href={url}
          target={resolvedTarget}
          rel={
            rel ??
            (resolvedTarget === "_blank" ? "noopener noreferrer" : undefined)
          }
          download={download}
          ref={ref}
        >
          {children}
        </a>
      );
    }

    return (
      <Link {...rest} to={url} target={resolvedTarget} ref={ref}>
        {children}
      </Link>
    );
  },
);

/** Polaris `linkComponent` (React 18 ref typing is stricter than Polaris's). */
export const PolarisRouterLink =
  PolarisRouterLinkBase as unknown as PolarisLinkComponent;
