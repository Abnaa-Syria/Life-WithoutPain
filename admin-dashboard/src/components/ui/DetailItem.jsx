import React from 'react';

const DetailItem = ({ label, value, render, fullWidth = false }) => {
  const displayValue = render ? render(value) : (value ?? <span className="text-[var(--text-muted)] italic">N/A</span>);

  return (
    <div className={`${fullWidth ? 'md:col-span-2 lg:col-span-3' : ''}`}>
      <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1.5">{label}</p>
      <div className="text-[var(--text-primary)] font-medium">
        {displayValue}
      </div>
    </div>
  );
};

export default DetailItem;
