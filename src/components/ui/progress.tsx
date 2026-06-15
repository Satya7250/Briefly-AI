import * as React from 'react';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Value from 0 to 100 */
  value: number;
  /** Optional className for custom styling */
  className?: string;
}

export function Progress({ value, className, ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`h-2 w-full rounded-full bg-muted ${className}`}
      {...props}
    >
      <div
        className="h-full w-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
