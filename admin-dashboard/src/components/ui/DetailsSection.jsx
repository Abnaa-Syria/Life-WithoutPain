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
    <div className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm ${className}`}>
      {(title || Icon) && (
        <div className="px-6 py-4 border-b border-[var(--border-color)] bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
          {Icon && <Icon size={20} className="text-[var(--primary)]" />}
          <h3 className="font-bold text-[var(--text-primary)]">{title}</h3>
        </div>
      )}
      <div className={`p-6 ${contentClassName}`}>
        <div className={contentLayoutClass}>{children}</div>
      </div>
    </div>
  );
};

export default DetailsSection;
