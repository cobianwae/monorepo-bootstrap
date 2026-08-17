'use client';

import * as React from 'react';
import { AreaChartComponent, ChartA11yTable, ChartCard } from '@ds/ui';
import type { WeightRecord } from '../types';

interface WeightTrajectoryChartProps {
  records: WeightRecord[];
  targetWeight?: number;
  title?: string;
  description?: string;
  className?: string;
}

export function WeightTrajectoryChart({
  records,
  targetWeight,
  title = 'Weight Trajectory & Body Composition',
  description = 'Historical progression showing body weight (kg) and body fat (%) across clinical weigh-ins.',
  className,
}: WeightTrajectoryChartProps) {
  const chartData = React.useMemo(() => {
    return records.map((r) => ({
      name: r.date.slice(5), // MM-DD
      weight: r.weight,
      bmi: r.bmi,
      bodyFat: r.bodyFatPct,
    }));
  }, [records]);

  const a11yRows = React.useMemo(
    () =>
      records.map((r) => ({
        date: r.date,
        weight: `${r.weight} kg`,
        bmi: r.bmi,
        bodyFat: `${r.bodyFatPct}%`,
      })),
    [records]
  );

  return (
    <div className={className}>
      <ChartCard
        title={title}
        description={description}
        className="border-border bg-card shadow-xs"
      >
        <div className="w-full">
          <AreaChartComponent data={chartData} dataKey={['weight', 'bodyFat']} xKey="name" />
        </div>

        {targetWeight && (
          <div className="mt-4 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs border border-border/40">
            <span className="font-mono text-muted-foreground text-[11px]">Target Weight Goal</span>
            <span className="font-display font-bold text-success text-sm">{targetWeight} kg</span>
          </div>
        )}

        <ChartA11yTable
          caption="Historical weight and body fat measurements"
          columns={[
            { key: 'date', header: 'Date' },
            { key: 'weight', header: 'Weight (kg)' },
            { key: 'bmi', header: 'BMI' },
            { key: 'bodyFat', header: 'Body Fat (%)' },
          ]}
          rows={a11yRows}
        />
      </ChartCard>
    </div>
  );
}