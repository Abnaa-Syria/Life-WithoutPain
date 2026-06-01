import React from 'react';

const Card = ({ title, subtitle, children, actions, className = '', bodyClassName = '' }) => {
  return (
    <div className={`card ${className}`}>
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between mb-8">
          <div>
            {title && <h3 className="text-card-title font-medium text-[var(--text-primary)]">{title}</h3>}
            {subtitle && <p className="text-body text-[var(--text-secondary)] mt-1.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className={`card-body ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
