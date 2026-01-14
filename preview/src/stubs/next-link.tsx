import React from 'react';

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string | { pathname?: string } | URL;
}

export default function Link({ href, children, ...rest }: LinkProps) {
  const resolved = typeof href === 'string' ? href : '#';
  return (
    <a href={resolved} {...rest}>
      {children}
    </a>
  );
}
