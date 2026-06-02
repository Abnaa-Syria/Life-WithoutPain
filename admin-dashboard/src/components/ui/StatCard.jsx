import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const GRADIENT_COLORS = new Set(['rose', 'lavender', 'accent', 'indigo', 'purple']);

const StatCard = ({ label, value, icon: Icon, trend, trendValue }) => {
  const iconWrapClass = 'stat-icon-wrap';

  return (
    <div className="card stat-card card-interactive flex flex-col gap-5 bg-white">
      <div className="flex items-center justify-between">
        <div className={`flex items-center justify-center shrink-0 ${iconWrapClass}`}>
          {Icon && <Icon size={24} className="text-[var(--primary-fg)]" />}
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-helper font-semibold px-2.5 py-1 rounded-full ${trend === 'up' ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--danger-bg)] text-[var(--danger)]'}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}%
          </div>
        )}
      </div>
      
      <div>
        <h4 className="text-[28px] font-semibold text-[var(--text-primary)] leading-tight">{value}</h4>
        <p className="text-body font-medium text-[var(--text-muted)] mt-1.5">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
