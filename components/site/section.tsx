import type { ComponentType, ReactNode } from "react";

interface SectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  icon?: ComponentType<{ className?: string }>;
  children: ReactNode;
  className?: string;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
  className,
}: SectionProps) {
  return (
    <section id={id} className={`scroll-mt-20 py-16 sm:py-24 ${className ?? ""}`}>
      <div className="mb-8 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-primary" aria-hidden="true" />}
          <span className="eyebrow">{eyebrow}</span>
        </div>
        <h2>{title}</h2>
        {description && (
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
