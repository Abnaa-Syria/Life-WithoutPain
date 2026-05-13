import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage';

const PageHeader = ({ title, breadcrumbs = [], action }) => {
  const { isRTL } = useLanguage();
  const Icon = isRTL ? ChevronLeft : ChevronRight;

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <nav className="flex items-center gap-2 mb-2 text-sm text-[var(--text-muted)]">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <Link to={crumb.path} className="hover:text-[var(--primary)] transition-colors">
                {crumb.label}
              </Link>
              {idx < breadcrumbs.length - 1 && <Icon size={14} />}
            </React.Fragment>
          ))}
        </nav>
        <h1 className="text-24 font-bold text-[var(--text-primary)]">{title}</h1>
      </div>
      {action && <div className="flex shrink-0">{action}</div>}
    </div>
  );
};

export default PageHeader;
