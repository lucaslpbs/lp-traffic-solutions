import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  LabelList
} from 'recharts';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import { chartAxis, chartColors } from '@/lib/chartColors';

interface ChartData {
  date: string;
  [key: string]: string | number;
}

interface SecondaryLine {
  dataKey: string;
  color: string;
  prefix?: string;
  suffix?: string;
  label?: string;
}

interface DashboardChartProps {
  title: string;
  data: ChartData[];
  dataKey: string;
  color?: string;
  type?: 'line' | 'area' | 'bar' | 'composed';
  prefix?: string;
  suffix?: string;
  className?: string;
  secondaryLine?: SecondaryLine;
  forceShowLabels?: boolean;
}

export const DashboardChart = ({
  title,
  data,
  dataKey,
  color = chartColors.brand,
  type = 'area',
  prefix = '',
  suffix = '',
  className,
  secondaryLine,
  forceShowLabels = false
}: DashboardChartProps) => {
  const [showLabels, setShowLabels] = useState(false);
  
  // Use forceShowLabels when set (for PDF generation)
  const effectiveShowLabels = forceShowLabels || showLabels;
  
  const formatValue = (value: number) => `${prefix}${value.toLocaleString('pt-BR')}${suffix}`;
  const formatSecondaryValue = (value: number) => 
    `${secondaryLine?.prefix || ''}${value.toLocaleString('pt-BR')}${secondaryLine?.suffix || ''}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-xl">
          <p className="text-xs text-muted-foreground">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm font-bold" style={{ color: entry.color }}>
              {entry.name}: {entry.dataKey === secondaryLine?.dataKey 
                ? formatSecondaryValue(entry.value) 
                : formatValue(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <button
          onClick={() => setShowLabels(!showLabels)}
          className="focus-ring flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded hover:bg-foreground/10"
        >
          {showLabels ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showLabels ? 'Esconder' : 'Mostrar'}
        </button>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'composed' || secondaryLine ? (
            <ComposedChart data={data}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartAxis.grid} />
              <XAxis 
                dataKey="date" 
                stroke={chartAxis.line} 
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                stroke={chartAxis.line} 
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              {secondaryLine && (
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke={chartAxis.line} 
                  tick={{ fill: chartAxis.tick, fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                />
              )}
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                yAxisId="left"
                dataKey={dataKey} 
                fill={color} 
                radius={[4, 4, 0, 0]}
                name="Conversas"
              >
                {effectiveShowLabels && (
                  <LabelList dataKey={dataKey} position="top" fill={color} fontSize={10} formatter={(v: number) => v.toLocaleString('pt-BR')} />
                )}
              </Bar>
              {secondaryLine && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={secondaryLine.dataKey}
                  stroke={secondaryLine.color}
                  strokeWidth={2}
                  dot={{ fill: secondaryLine.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: secondaryLine.color, strokeWidth: 2 }}
                  name={secondaryLine.label || 'Custo/Conversa'}
                >
                  {effectiveShowLabels && (
                    <LabelList 
                      dataKey={secondaryLine.dataKey} 
                      position="top" 
                      fill={secondaryLine.color} 
                      fontSize={10} 
                      formatter={(v: number) => `R$ ${v.toFixed(2)}`} 
                    />
                  )}
                </Line>
              )}
            </ComposedChart>
          ) : type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chartAxis.grid} />
              <XAxis 
                dataKey="date" 
                stroke={chartAxis.line} 
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
              />
              <YAxis 
                stroke={chartAxis.line} 
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${dataKey})`}
              >
                {effectiveShowLabels && (
                  <LabelList dataKey={dataKey} position="top" fill={color} fontSize={10} formatter={(v: number) => formatValue(v)} />
                )}
              </Area>
            </AreaChart>
          ) : type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartAxis.grid} />
              <XAxis 
                dataKey="date" 
                stroke={chartAxis.line} 
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
              />
              <YAxis 
                stroke={chartAxis.line} 
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}>
                {effectiveShowLabels && (
                  <LabelList dataKey={dataKey} position="top" fill={color} fontSize={10} formatter={(v: number) => formatValue(v)} />
                )}
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartAxis.grid} />
              <XAxis 
                dataKey="date" 
                stroke={chartAxis.line} 
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
              />
              <YAxis 
                stroke={chartAxis.line} 
                tick={{ fill: chartAxis.tick, fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                dot={{ fill: color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
              >
                {effectiveShowLabels && (
                  <LabelList dataKey={dataKey} position="top" fill={color} fontSize={10} formatter={(v: number) => formatValue(v)} />
                )}
              </Line>
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
