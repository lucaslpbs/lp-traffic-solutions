import { cn } from '@/lib/utils';

/**
 * Skeletons do painel interno — substituem o <Loader2 /> centralizado, que
 * some com o layout inteiro enquanto carrega. Cada bloco reproduz a caixa que
 * vai ocupar o lugar, entao a tela nao "pula" quando os dados chegam.
 */

/** Bloco base com brilho passando. */
export const Shimmer = ({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div
    className={cn('relative overflow-hidden rounded-md bg-surface-2', className)}
    style={style}
    aria-hidden
  >
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-foreground/[0.06] to-transparent" />
  </div>
);

export const KPICardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card p-5">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3.5 w-24" />
        <Shimmer className="h-7 w-32" />
      </div>
      <Shimmer className="h-12 w-12 rounded-lg" />
    </div>
  </div>
);

export const KPIGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <KPICardSkeleton key={i} />
    ))}
  </div>
);

export const ChartSkeleton = ({ className }: { className?: string }) => (
  <div className={cn('rounded-xl border border-border bg-card p-5', className)}>
    <div className="flex items-center justify-between mb-6">
      <Shimmer className="h-5 w-40" />
      <Shimmer className="h-4 w-16" />
    </div>
    <div className="h-64 flex items-end gap-2">
      {[45, 70, 35, 85, 55, 75, 40, 65, 50, 80].map((h, i) => (
        <Shimmer key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

export const ChartGridSkeleton = ({ count = 2 }: { count?: number }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ChartSkeleton key={i} />
    ))}
  </div>
);

export const ListSkeleton = ({ rows = 4 }: { rows?: number }) => (
  <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3">
        <Shimmer className="h-12 w-12 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-1/3" />
          <Shimmer className="h-3 w-1/2" />
        </div>
        <Shimmer className="h-6 w-20 rounded-full flex-shrink-0" />
      </div>
    ))}
  </div>
);

export const TableSkeleton = ({ rows = 6 }: { rows?: number }) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="px-4 py-3 border-b border-border">
      <Shimmer className="h-5 w-44" />
    </div>
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <Shimmer className="h-8 w-8 rounded-full flex-shrink-0" />
          <Shimmer className="h-4 flex-1" />
          <Shimmer className="h-4 w-24 flex-shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

export const CardGridSkeleton = ({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) => (
  <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <Shimmer className="h-12 w-12 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-2/3" />
            <Shimmer className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const PageHeaderSkeleton = () => (
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    <div className="flex items-center gap-4">
      <Shimmer className="h-12 w-12 rounded-xl" />
      <div className="space-y-2">
        <Shimmer className="h-6 w-48" />
        <Shimmer className="h-3.5 w-32" />
      </div>
    </div>
    <Shimmer className="h-10 w-64" />
  </div>
);
