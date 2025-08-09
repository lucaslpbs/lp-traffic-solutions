import { cn } from "@/lib/utils";

interface StatsProps {
  number: string;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function Stats({ number, label, prefix = "", suffix = "", className }: StatsProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
        {prefix}{number}{suffix}
      </div>
      <div className="text-sm md:text-base text-muted-foreground">
        {label}
      </div>
    </div>
  );
}