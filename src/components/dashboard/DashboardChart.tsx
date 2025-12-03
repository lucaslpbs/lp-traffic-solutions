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
  Bar
} from 'recharts';
import { cn } from '@/lib/utils';

interface ChartData {
  date: string;
  [key: string]: string | number;
}

interface DashboardChartProps {
  title: string;
  data: ChartData[];
  dataKey: string;
  color?: string;
  type?: 'line' | 'area' | 'bar';
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const DashboardChart = ({
  title,
  data,
  dataKey,
  color = 'hsl(330, 100%, 60%)',
  type = 'area',
  prefix = '',
  suffix = '',
  className
}: DashboardChartProps) => {
  const formatValue = (value: number) => `${prefix}${value.toLocaleString('pt-BR')}${suffix}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card rounded-lg p-3 neon-border">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-sm font-bold text-foreground">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={cn("glass-card rounded-xl p-5 neon-border", className)}>
      <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'area' ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(0, 0%, 50%)" 
                tick={{ fill: 'hsl(0, 0%, 65%)', fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(0, 0%, 50%)" 
                tick={{ fill: 'hsl(0, 0%, 65%)', fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fill={`url(#gradient-${dataKey})`}
              />
            </AreaChart>
          ) : type === 'bar' ? (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(0, 0%, 50%)" 
                tick={{ fill: 'hsl(0, 0%, 65%)', fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(0, 0%, 50%)" 
                tick={{ fill: 'hsl(0, 0%, 65%)', fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 20%)" />
              <XAxis 
                dataKey="date" 
                stroke="hsl(0, 0%, 50%)" 
                tick={{ fill: 'hsl(0, 0%, 65%)', fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(0, 0%, 50%)" 
                tick={{ fill: 'hsl(0, 0%, 65%)', fontSize: 12 }}
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
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
