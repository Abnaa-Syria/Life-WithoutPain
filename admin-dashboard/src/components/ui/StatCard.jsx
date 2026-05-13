import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, trend, trendValue, color = 'indigo' }) => {
  const colorMap = {
    indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600', darkBg: 'dark:bg-indigo-900/20' },
    green: { bg: 'bg-emerald-100', text: 'text-emerald-600', darkBg: 'dark:bg-emerald-900/20' },
    red: { bg: 'bg-red-100', text: 'text-red-600', darkBg: 'dark:bg-red-900/20' },
    yellow: { bg: 'bg-amber-100', text: 'text-amber-600', darkBg: 'dark:bg-amber-900/20' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', darkBg: 'dark:bg-purple-900/20' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', darkBg: 'dark:bg-blue-900/20' },
  };

  const selectedColor = colorMap[color] || colorMap.indigo;

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-2xl ${selectedColor.bg} ${selectedColor.darkBg} ${selectedColor.text}`}>
          {Icon && <Icon size={24} />}
        </div>
        {trendValue && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-red-100 text-red-600 dark:bg-red-900/20'}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}%
          </div>
        )}
      </div>
      
      <div>
        <h4 className="text-3xl font-bold text-[var(--text-primary)]">{value}</h4>
        <p className="text-sm font-medium text-[var(--text-muted)] mt-1">{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
