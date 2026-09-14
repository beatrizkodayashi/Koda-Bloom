import type { ReactNode } from 'react';

type CardProps = {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClass?: string;
  showDots?: boolean;
  plain?: boolean;
};

export function Card({
  title,
  children,
  className = '',
  bodyClass = '',
  showDots = true,
  plain = false,
}: CardProps) {
  if (plain) {
    return <div className={`card-bloom card-bloom--plain ${className}`.trim()}>{children}</div>;
  }

  return (
    <div className={`card-bloom ${className}`.trim()}>
      <div className="card-bloom-header">
        <h3 className="card-bloom-title">{title}</h3>
        {showDots ? (
          <span className="card-bloom-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        ) : null}
      </div>
      <div className={`card-bloom-body ${bodyClass}`.trim()}>{children}</div>
    </div>
  );
}
