/**
 * Navix Dashboard — CostAreaChart
 * --------------------------------------------------------------------------
 * Graphique de surface (Area Chart) SVG lissé pour l'évolution temporelle
 * des dépenses mensuelles avec dégradé subtil, grille discrète et tooltips au survol.
 */
import { useMemo, useState } from 'react';
import { formatCurrency } from '@/utils/format';
import './DashChart.css';

const CostAreaChart = ({ data = [] }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const { points, pathD, areaD, chartData } = useMemo(() => {
    if (!data || data.length === 0) {
      return { points: [], pathD: '', areaD: '', maxValue: 1, chartData: [] };
    }

    const items = data.map((d) => ({
      label: d.label || d.month,
      value: Number(d.total || d.totalCost || 0),
      fuel: Number(d.fuel || d.fuelCost || 0),
      maintenance: Number(d.maintenance || d.maintenanceCost || 0),
    }));

    const max = Math.max(...items.map((i) => i.value), 1) * 1.15;
    const width = 600;
    const height = 200;
    const padding = 25;

    const pts = items.map((item, index) => {
      const x = padding + (index / (items.length - 1 || 1)) * (width - 2 * padding);
      const y = height - padding - (item.value / max) * (height - 2 * padding);
      return { x, y, ...item, index };
    });

    if (pts.length === 1) {
      const p = pts[0];
      return {
        points: pts,
        pathD: `M ${padding} ${p.y} L ${width - padding} ${p.y}`,
        areaD: `M ${padding} ${p.y} L ${width - padding} ${p.y} L ${width - padding} ${height - padding} L ${padding} ${height - padding} Z`,
        maxValue: max,
        chartData: items,
      };
    }

    // Build smooth cubic Bezier path
    let dPath = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i += 1) {
      const curr = pts[i];
      const next = pts[i + 1];
      const cp1X = curr.x + (next.x - curr.x) / 2;
      const cp1Y = curr.y;
      const cp2X = curr.x + (next.x - curr.x) / 2;
      const cp2Y = next.y;
      dPath += ` C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${next.x} ${next.y}`;
    }

    const areaPath = `${dPath} L ${pts[pts.length - 1].x} ${height - padding} L ${pts[0].x} ${height - padding} Z`;

    return {
      points: pts,
      pathD: dPath,
      areaD: areaPath,
      maxValue: max,
      chartData: items,
    };
  }, [data]);

  if (chartData.length === 0) {
    return <p className="text-muted text-center py-4">Aucune donnée pour la période.</p>;
  }

  const width = 600;
  const height = 200;
  const padding = 25;

  return (
    <div className="navix-area-chart-container position-relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="navix-area-chart-svg w-100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="navixCostAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--navix-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--navix-primary)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="var(--navix-border-color-subtle)" strokeDasharray="4" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="var(--navix-border-color-subtle)" strokeDasharray="4" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="var(--navix-border-color-subtle)" />

        {/* Filled Area */}
        <path d={areaD} fill="url(#navixCostAreaGradient)" />

        {/* Line Stroke */}
        <path d={pathD} fill="none" stroke="var(--navix-primary)" strokeWidth="3.5" strokeLinecap="round" />

        {/* Points */}
        {points.map((pt) => {
          const isHovered = hoverIndex === pt.index;
          return (
            <g key={pt.index} onMouseEnter={() => setHoverIndex(pt.index)} onMouseLeave={() => setHoverIndex(null)}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 7 : 4}
                fill="var(--navix-surface)"
                stroke="var(--navix-primary)"
                strokeWidth={isHovered ? 3 : 2}
                className="navix-chart-point"
              />
            </g>
          );
        })}
      </svg>

      {/* X Axis Labels */}
      <div className="d-flex justify-content-between px-3 mt-2">
        {points.map((pt) => (
          <span
            key={pt.index}
            className={`small text-muted ${hoverIndex === pt.index ? 'fw-bold text-primary' : ''}`}
          >
            {pt.label}
          </span>
        ))}
      </div>

      {/* Hover Tooltip Card */}
      {hoverIndex !== null && points[hoverIndex] && (
        <div
          className="navix-chart-tooltip shadow-sm rounded-3 p-2 bg-dark text-white border border-secondary"
          style={{
            position: 'absolute',
            top: '5%',
            left: `${(points[hoverIndex].x / width) * 85}%`,
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          <div className="fw-semibold small">{points[hoverIndex].label}</div>
          <div className="text-info small">Total : {formatCurrency(points[hoverIndex].value, 'XAF')}</div>
        </div>
      )}
    </div>
  );
};

export default CostAreaChart;
