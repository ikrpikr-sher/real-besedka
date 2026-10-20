import type { ReactNode } from 'react';

type Props = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** Серверная ссылка — без client JS и hydration. */
export default function NavLink({ href, className, children }: Props) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
