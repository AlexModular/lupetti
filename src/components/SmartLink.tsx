import Link from "next/link";
import { stegaClean } from "@sanity/client/stega";
import type { ReactNode } from "react";

interface SmartLinkProps {
  href?: string | null;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  "aria-label"?: string;
}

/**
 * Link che capisce da solo se la destinazione è interna (navigazione veloce
 * di Next) o esterna (nuova scheda), oppure telefono/email.
 */
export default function SmartLink({ href, children, ...props }: SmartLinkProps) {
  const url = stegaClean(href) || "/";

  if (/^(mailto:|tel:)/.test(url)) {
    return (
      <a href={url} {...props}>
        {children}
      </a>
    );
  }
  if (/^https?:\/\//.test(url)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={url} {...props}>
      {children}
    </Link>
  );
}
