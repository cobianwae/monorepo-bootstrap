'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
] as const;

export type ChartColor = (typeof CHART_COLORS)[number];

const COMPACT_NUMBER_FORMATTER = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const formatCompactTick = (value: number) => COMPACT_NUMBER_FORMATTER.format(value);

export interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactElement;
  title?: string;
  description?: string;
  className?: string;
}

export const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ children, title, description, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex aspect-[16/9] w-full flex-col rounded-md border border-border bg-card p-4',
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="mb-4 space-y-0.5">
            {title && (
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
              </div>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        )}
        <div className="min-h-0 flex-1">
          <ResponsiveContainer width="100%" height="100%">
            {children}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
);
ChartContainer.displayName = 'ChartContainer';

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: {
    name?: string | number;
    value?: string | number | Array<string | number>;
    color?: string;
    dataKey?: string | number;
    payload?: Record<string, unknown>;
  }[];
  label?: React.ReactNode;
  hideLabel?: boolean;
  indicator?: 'dot' | 'line' | 'dashed';
  labelKey?: string;
}

export const ChartTooltipContent = React.forwardRef<HTMLDivElement, ChartTooltipContentProps>(
  ({ active, payload, label, hideLabel = false, indicator = 'dot', labelKey }, ref) => {
    if (!active || !payload?.length) return null;

    return (
      <div
        ref={ref}
        className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-md"
      >
        {!hideLabel && label !== undefined && (
          <div className="font-medium text-foreground">{label}</div>
        )}
        <div className="grid gap-1">
          {payload.map((entry, index) => {
            const color = (entry.color as string) ?? CHART_COLORS[index % CHART_COLORS.length];
            const key = labelKey ? String((entry.payload as Record<string, unknown>)[labelKey]) : entry.name;
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span
                    className={cn(
                      'h-2.5 w-2.5 shrink-0 rounded-[2px]',
                      indicator === 'line' && 'h-0 w-4 rounded-full',
                      indicator === 'dashed' && 'h-0 w-4 rounded-full border border-dashed'
                    )}
                    style={{ backgroundColor: indicator === 'dot' ? color : undefined, borderColor: indicator === 'dashed' ? color : undefined }}
                  />
                  <span>{key}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-foreground tabular-nums">
                    {typeof entry.value === 'number' ? entry.value.toLocaleString() : String(entry.value)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
);
ChartTooltipContent.displayName = 'ChartTooltipContent';

interface BaseChartProps {
  data: Record<string, unknown>[];
  dataKey: string | string[];
  xKey: string;
  colors?: string[];
  stacked?: boolean;
  grid?: boolean;
  showLegend?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

export interface AreaChartProps extends BaseChartProps {
  variant?: 'gradient' | 'flat';
  fillOpacity?: number;
}

export function AreaChartComponent({
  data,
  dataKey,
  xKey,
  colors = [...CHART_COLORS],
  grid = true,
  showLegend = true,
  stacked = false,
  className,
  title,
  description,
  variant = 'gradient',
  fillOpacity = 0.35,
}: AreaChartProps) {
  const series = Array.isArray(dataKey) ? dataKey : [dataKey];
  const chartId = React.useId().replace(/:/g, '');

  return (
    <ChartContainer title={title} description={description} className={className}>
      <AreaChart data={data} margin={{ top: 12, right: 12, bottom: 4, left: 4 }}>
        {variant === 'gradient' && (
          <defs>
            {series.map((key, index) => {
              const color = colors[index % colors.length];
              return (
                <linearGradient
                  key={`grad-${key}`}
                  id={`area-grad-${chartId}-${index}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
                  <stop offset="75%" stopColor={color} stopOpacity={Math.max(0.02, fillOpacity * 0.15)} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              );
            })}
          </defs>
        )}
        {grid && (
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            vertical={false}
          />
        )}
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickFormatter={formatCompactTick}
          dx={-4}
        />
        <Tooltip
          content={<ChartTooltipContent />}
          cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
        />
        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)', paddingTop: 8 }}
          />
        )}
        {series.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            fill={variant === 'gradient' ? `url(#area-grad-${chartId}-${index})` : colors[index % colors.length]}
            fillOpacity={variant === 'gradient' ? 1 : 0}
            strokeWidth={2.5}
            activeDot={{
              r: 4,
              strokeWidth: 2,
              fill: 'var(--card)',
              stroke: colors[index % colors.length],
            }}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}

export function BarChartComponent({
  data,
  dataKey,
  xKey,
  colors = [...CHART_COLORS],
  grid = true,
  showLegend = true,
  stacked = false,
  className,
  title,
  description,
}: BaseChartProps) {
  const series = Array.isArray(dataKey) ? dataKey : [dataKey];
  return (
    <ChartContainer title={title} description={description} className={className}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        {grid && <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />}
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          tickFormatter={formatCompactTick}
        />
        <Tooltip content={<ChartTooltipContent />} />
        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
          />
        )}
        {series.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={colors[index % colors.length]}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
            maxBarSize={36}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

export function LineChartComponent({
  data,
  dataKey,
  xKey,
  colors = [...CHART_COLORS],
  grid = true,
  showLegend = true,
  className,
  title,
  description,
}: BaseChartProps) {
  const series = Array.isArray(dataKey) ? dataKey : [dataKey];
  return (
    <ChartContainer title={title} description={description} className={className}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
        {grid && <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />}
        <XAxis
          dataKey={xKey}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          dy={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          tickFormatter={formatCompactTick}
        />
        <Tooltip content={<ChartTooltipContent />} />
        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
          />
        )}
        {series.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={colors[index % colors.length]}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 2, fill: 'var(--card)' }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}

export interface PieChartProps {
  data: { name: string; value: number }[];
  colors?: string[];
  title?: string;
  description?: string;
  innerRadius?: number | string;
  outerRadius?: number | string;
  showLegend?: boolean;
  className?: string;
}

export function PieChartComponent({
  data,
  colors = [...CHART_COLORS],
  title,
  description,
  innerRadius = '55%',
  outerRadius = '80%',
  showLegend = true,
  className,
}: PieChartProps) {
  return (
    <ChartContainer title={title} description={description} className={className}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          stroke="var(--card)"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltipContent />} />
        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, color: 'var(--muted-foreground)' }}
          />
        )}
      </PieChart>
    </ChartContainer>
  );
}

export interface SparklineProps {
  data: Record<string, unknown>[];
  dataKey: string;
  color?: string;
  width?: number;
  height?: number;
  className?: string;
}

export function Sparkline({
  data,
  dataKey,
  color = 'var(--chart-1)',
  width = 96,
  height = 32,
  className,
}: SparklineProps) {
  return (
    <div className={cn('inline-block', className)} style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${dataKey})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export interface ChartCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  trend?: {
    value: string;
    direction: 'up' | 'down';
  };
}

export function ChartCard({
  title,
  description,
  icon: Icon,
  action,
  trend,
  className,
  children,
  ...props
}: ChartCardProps) {
  return (
    <div
      className={cn('rounded-md border border-border bg-card p-4 shadow-xs', className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {Icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-2">
          <span className={cn('text-lg font-semibold', trend.direction === 'up' ? 'text-success' : 'text-destructive')}>
            {trend.value}
          </span>
          <span className="text-xs text-muted-foreground">
            {trend.direction === 'up' ? '↑' : '↓'} vs last period
          </span>
        </div>
      )}
      {children}
    </div>
  );
}