'use client';

import type {
  AnchorHTMLAttributes,
  MouseEvent,
  ReactNode,
} from 'react';

type HardBoundaryLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  'href' | 'onClick'
> & {
  href: string;
  children: ReactNode;
};

export function HardBoundaryLink({
  href,
  children,
  target,
  ...props
}: HardBoundaryLinkProps) {
  function handleClick(
    event: MouseEvent<HTMLAnchorElement>,
  ) {
    const modifiedClick =
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey;

    if (
      event.defaultPrevented ||
      modifiedClick ||
      target === '_blank'
    ) {
      return;
    }

    event.preventDefault();
    window.location.assign(href);
  }

  return (
    <a
      {...props}
      href={href}
      target={target}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}