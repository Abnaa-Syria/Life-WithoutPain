import React from 'react';

const DetailsSection = ({
  title,
  icon: Icon,
  children,
  className = '',
  contentClassName = '',
  layout = 'grid',
}) => {
  const contentLayoutClass =
    layout === 'stack'
      ? 'flex flex-col gap-y-6'
      : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8';

  return (
    <div className={`card !p-0 overflow-hidden ${className}`}>
      {(title || Icon) && (
        <div className="px-6 py-4 border-b border-[var(--divider)] bg-[var(--surface-secondary)] flex items-center gap-3">
          {Icon && <Icon size={20} className="text-[var(--primary)]" />}
          <h3 className="text-card-title font-semibold text-[var(--text-primary)]">{title}</h3>
        </div>
      )}
      <div className={`p-6 ${contentClassName}`}>
        <div className={contentLayoutClass}>{children}</div>
      </div>
    </div>
  );
};

export default DetailsSection;
