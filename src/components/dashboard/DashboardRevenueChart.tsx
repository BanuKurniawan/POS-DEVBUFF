import React from "react";

interface WeeklySalesItem {
  day: string;
  amount: number;
}

interface DashboardRevenueChartProps {
  weeklyData: WeeklySalesItem[];
}

export const DashboardRevenueChart: React.FC<DashboardRevenueChartProps> = ({ weeklyData }) => {
  const maxSales = Math.max(...weeklyData.map((d) => d.amount), 100000);
  const chartHeight = 160;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 25;

  const points = weeklyData.map((d, idx) => {
    const x =
      paddingX + (idx / Math.max(weeklyData.length - 1, 1)) * (chartWidth - paddingX * 2);
    const y =
      chartHeight -
      paddingY -
      (d.amount / maxSales) * (chartHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, "");

  return (
    <div className="bg-surface border border-border rounded-md p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div>
          <h2 className="text-sm font-bold text-text tracking-tight">
            Tren Omset 7 Hari Terakhir
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Grafik pergerakan nilai transaksi harian toko
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-mono num">
          <span className="w-2.5 h-2.5 rounded-full bg-accent inline-block"></span>
          <span>Omset (Rp)</span>
        </div>
      </div>

      <div className="w-full overflow-x-auto pt-2">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 overflow-visible"
          preserveAspectRatio="none"
        >
          {/* Faint Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = chartHeight - paddingY - pct * (chartHeight - paddingY * 2);
            return (
              <g key={pct}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-border"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {/* SVG Line */}
          {points.length > 1 && (
            <path
              d={pathD}
              fill="none"
              stroke="currentColor"
              className="text-accent"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx} className="group">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                fill="currentColor"
                className="text-accent"
              />
              <text
                x={pt.x}
                y={chartHeight - 6}
                textAnchor="middle"
                className="text-[10px] fill-current text-text-muted font-mono"
              >
                {pt.day.split(",")[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

