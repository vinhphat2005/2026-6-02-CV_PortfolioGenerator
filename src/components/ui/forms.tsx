import type React from "react";
import { Trash2 } from "lucide-react";

export const inputClass =
  "h-9 w-full rounded-[8px] border border-border bg-white px-3 text-sm outline-none focus-visible:border-primary";
export const textareaClass =
  "min-h-24 w-full rounded-[8px] border border-border bg-white px-3 py-2 text-sm leading-relaxed outline-none focus-visible:border-primary";

export function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "border border-border bg-white text-foreground hover:bg-muted",
    ghost: "text-foreground hover:bg-muted",
    danger: "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
  };
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-[8px] px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-55 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[8px] border border-border bg-card p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-black uppercase tracking-[0.06em]">{title}</h2>
      {children}
    </section>
  );
}

export function RecordEditor({
  title,
  onDelete,
  children
}: {
  title: string;
  onDelete: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[8px] border border-border bg-white p-3">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="font-bold">{title}</h3>
        <Button variant="danger" onClick={onDelete} title="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}
