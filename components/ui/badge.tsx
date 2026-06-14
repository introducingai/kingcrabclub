import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "outline" | "destructive";
};

const variants = {
  default: "border-primary/40 bg-primary/16 text-primary",
  secondary: "border-accent/40 bg-accent/16 text-accent-foreground",
  outline: "border-border bg-transparent text-muted-foreground",
  destructive: "border-destructive/40 bg-destructive/12 text-destructive",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border-2 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em]",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
