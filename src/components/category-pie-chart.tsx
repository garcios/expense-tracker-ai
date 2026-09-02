"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { CategoryTotal } from "@/lib/analytics";
import { CATEGORY_META } from "@/lib/categories";
import { formatCurrency } from "@/lib/format";
import { EmptyState } from "@/components/empty-state";
import { PieChart as PieChartIcon } from "lucide-react";

interface CategoryPieChartProps {
  data: CategoryTotal[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <EmptyState
        icon={PieChartIcon}
        title="No category data yet"
        description="Add an expense to see how your spending breaks down by category."
      />
    );
  }

  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="category"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.category} fill={CATEGORY_META[entry.category].color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, _name, item) => [
                formatCurrency(Number(value)),
                item?.payload?.category,
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 13,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((entry) => (
          <li key={entry.category} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-1.5 truncate text-slate-600">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${CATEGORY_META[entry.category].dotClass}`}
              />
              {entry.category}
            </span>
            <span className="font-medium text-slate-900">{formatCurrency(entry.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
