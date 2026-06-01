import React from 'react';
import { PackageOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const EmptyState = ({ title, description, icon: Icon = PackageOpen, action }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-20 h-20 bg-[var(--surface-secondary)] rounded-full flex items-center justify-center text-[var(--text-muted)] mb-6">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-section-title mb-2">
        {title || t('common.no_data')}
      </h3>
      <p className="text-body text-[var(--text-muted)] max-w-sm mb-8">
        {description || t('common.no_data_desc')}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
