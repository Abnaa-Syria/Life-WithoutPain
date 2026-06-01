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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
      <div className="flex items-start gap-4">
        <button 
          type="button"
          onClick={() => backPath ? navigate(backPath) : navigate(-1)}
          className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all"
        >
          {isRTL ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-page-title">{title}</h1>
            {badges.map((badge, idx) => (
              <span key={idx} className={`badge ${badge.className}`}>
                {badge.label}
              </span>
            ))}
          </div>
          {subtitle && <p className="text-body text-[var(--text-muted)] mt-2">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            type="button"
            onClick={action.onClick} 
            className={`btn flex items-center gap-2 ${action.className || 'btn-primary'}`}
          >
            {action.icon && <action.icon size={18} />}
            {action.label}
          </button>
        ))}
        {onEdit && (
          <button type="button" onClick={onEdit} className="btn btn-secondary">
            <Edit size={18} />
            {t('common.edit')}
          </button>
        )}
        {onDelete && (
          <button type="button" onClick={onDelete} className="btn btn-danger">
            <Trash2 size={18} />
            {t('common.delete')}
          </button>
        )}
      </div>
    </div>
  );
};

export default DetailsHeader;
