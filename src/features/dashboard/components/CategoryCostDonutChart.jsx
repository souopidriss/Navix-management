/**
 * Navix Dashboard — CategoryCostDonutChart
 * --------------------------------------------------------------------------
 * Graphique circulaire Donut SVG interactif et responsive pour la répartition
 * des dépenses par catégorie (Carburant, Entretiens, Pièces & Assurance, Péages).
 * Affichage du montant total au centre et légende détaillée avec montants FCFA.
 */
import { useMemo } from 'react';
import { formatCurrency } from '@/utils/format';
import './DashChart.css';

const CATEGORY_COLORS = {
  fuel: { label: 'Carburant', color: '#4da3ff', bgClass: 'bg-info' },
  maintenance: { label: 'Entretiens', color: '#f5a524', bgClass: 'bg-warning' },
  parts: { label: 'Pièces & Assurance', color: '#7a6ff2', bgClass: 'bg-primary' },
  tolls: { label: 'Péages & Divers', color: '#3fcb8f', bgClass: 'bg-success' },
};

const CategoryCostDonutChart = ({ financialData }) => {
  const { categories, totalAmount } = useMemo(() => {
    if (!financialData) {
      return { categories: [], totalAmount: 0 };
    }

    const monthFuel = Number(financialData.monthFuel || 0);
    const monthMaintenance = Number(financialData.monthMaintenance || 0);
    const monthOther = Number(financialData.monthOther || 0);
    
    // Estimate breakdown if parts/tolls not separated
    const partsCost = Math.round(monthOther * 0.65);
    const tollsCost = Math.round(monthOther * 0.35);

    const total = monthFuel + monthMaintenance + partsCost + tollsCost || 1;

    const items = [
      { key: 'fuel', amount: monthFuel, ...CATEGORY_COLORS.fuel },
      { key: 'maintenance', amount: monthMaintenance, ...CATEGORY_COLORS.maintenance },
      { key: 'parts', amount: partsCost, ...CATEGORY_COLORS.parts },
      { key: 'tolls', amount: tollsCost, ...CATEGORY_COLORS.tolls },
    ].map((item) => ({
      ...item,
      percentage: Math.round((item.amount / total) * 100),
    }));

    return { categories: items, totalAmount: total };
  }, [financialData]);

  // SVG parameters
  const size = 180;
  const strokeWidth = 22;
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="navix-donut-chart-card">
      <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
        <div className="navix-donut-wrapper position-relative flex-shrink-0">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="navix-donut-svg">
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="var(--navix-border-color-subtle)"
              strokeWidth={strokeWidth}
            />
            {categories.map((cat) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += cat.percentage;

              return (
                <circle
                  key={cat.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="navix-donut-segment"
                />
              );
            })}
          </svg>
          <div className="navix-donut-center text-center">
            <span className="navix-donut-total-label d-block text-muted">Total</span>
            <span className="navix-donut-total-value fw-bold">
              {formatCurrency(totalAmount, 'XAF')}
            </span>
          </div>
        </div>

        <div className="navix-donut-legend flex-grow-1 w-100">
          {categories.map((cat) => (
            <div key={cat.key} className="navix-donut-legend-item d-flex align-items-center justify-content-between py-2 border-bottom border-secondary-subtle">
              <div className="d-flex align-items-center gap-2">
                <span className="navix-donut-dot" style={{ backgroundColor: cat.color }} />
                <span className="fw-medium text-body-secondary">{cat.label}</span>
              </div>
              <div className="text-end">
                <span className="fw-semibold me-2">{formatCurrency(cat.amount, 'XAF')}</span>
                <span className="badge bg-secondary-subtle text-body-secondary">{cat.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryCostDonutChart;
