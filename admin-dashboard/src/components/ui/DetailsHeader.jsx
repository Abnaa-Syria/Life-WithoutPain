import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useLanguage from '../../hooks/useLanguage';

const DetailsHeader = ({ title, subtitle, badges = [], onEdit, onDelete, backPath, actions = [] }) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div className="flex items-start gap-4">
        <button 
          onClick={() => backPath ? navigate(backPath) : navigate(-1)}
          className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
        >
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">{title}</h1>
            {badges.map((badge, idx) => (
              <span key={idx} className={`badge ${badge.className}`}>
                {badge.label}
              </span>
            ))}
          </div>
          {subtitle && <p className="text-[var(--text-muted)] mt-1">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions.map((action, idx) => (
          <button 
            key={idx} 
            onClick={action.onClick} 
            className={`btn px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium ${action.className || 'btn-primary'}`}
          >
            {action.icon && <action.icon size={18} />}
            {action.label}
          </button>
        ))}
        {onEdit && (
          <button onClick={onEdit} className="btn btn-secondary py-2.5">
            <Edit size={18} />
            {t('common.edit')}
          </button>
        )}
        {onDelete && (
          <button onClick={onDelete} className="btn bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 border border-transparent px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-medium">
            <Trash2 size={18} />
            {t('common.delete')}
          </button>
        )}
      </div>
    </div>
  );
};

export default DetailsHeader;
