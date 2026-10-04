"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

type AccordionContextValue = {
  openItem: string | null;
  toggle: (v: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

function Accordion({
  className,
  children,
  defaultValue,
  ...props
}: React.ComponentProps<"div"> & { defaultValue?: string }) {
  const [openItem, setOpenItem] = React.useState<string | null>(defaultValue ?? null);
  const toggle = React.useCallback((v: string) => {
    setOpenItem((prev) => (prev === v ? null : v));
  }, []);

  return (
    <AccordionContext.Provider value={{ openItem, toggle }}>
      <div data-slot="accordion" className={cn(className)} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

function AccordionItem({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  return (
    <div
      data-slot="accordion-item"
      data-value={value}
      className={cn("border-b border-border last:border-none", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function AccordionTrigger({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { value: string }) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("<AccordionTrigger> must be used inside <Accordion>");
  const open = ctx.openItem === value;
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => ctx.toggle(value)}
      className={cn(
        "flex w-full items-center justify-between gap-3 py-4 text-left text-sm font-semibold text-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden="true"
        className={cn(
          "size-5 shrink-0 text-primary transition-transform",
          open ? "rotate-180" : "rotate-0 text-muted-foreground"
        )}
      />
    </button>
  );
}

function AccordionContent({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { value: string }) {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("<AccordionContent> must be used inside <Accordion>");
  if (ctx.openItem !== value) return null;
  return (
    <div className={cn("pb-4 text-sm text-muted-foreground", className)} {...props}>
      {children}
    </div>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
