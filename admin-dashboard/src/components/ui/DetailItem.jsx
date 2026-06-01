import React from 'react';

const DetailItem = ({ label, value, render, fullWidth = false }) => {
  const displayValue = render ? render(value) : (value ?? <span className="text-[var(--text-muted)] italic">N/A</span>);

  return (
    <div className={`${fullWidth ? 'md:col-span-2 lg:col-span-3' : ''}`}>
      <p className="text-label text-[var(--text-muted)] mb-2">{label}</p>
      <div className="text-body font-medium text-[var(--text-primary)]">
        {displayValue}
      </div>
    </div>
  );
};

export default DetailItem;
