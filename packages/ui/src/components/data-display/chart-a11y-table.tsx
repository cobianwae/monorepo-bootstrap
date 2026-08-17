import type * as React from 'react';

export interface ChartA11yTableColumn {
  key: string;
  header: string;
}

export interface ChartA11yTableProps {
  caption: string;
  columns: ChartA11yTableColumn[];
  rows: Array<Record<string, React.ReactNode>>;
}

export function ChartA11yTable({ caption, columns, rows }: ChartA11yTableProps) {
  return (
    <table className="sr-only">
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} scope="col">
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.key}>{row[column.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}