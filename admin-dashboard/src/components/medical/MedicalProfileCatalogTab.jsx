import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Badge from '../ui/Badge';
import CatalogMultiSelect from './CatalogMultiSelect';
import useLanguage from '../../hooks/useLanguage';
import toast from 'react-hot-toast';
import { Pencil, Save, X } from 'lucide-react';

export default function MedicalProfileCatalogTab({
  patientId,
  catalogEndpoint,
  idsField,
  items,
  medicalProfile,
  title,
}) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    setSelectedIds(medicalProfile?.[idsField] || []);
  }, [medicalProfile, idsField]);

  const saveMutation = useMutation({
    mutationFn: (payload) => api.put(`/admin/patients/${patientId}/medical-profile`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient', String(patientId)] });
      toast.success(t('messages.saved'));
      setIsEditing(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('messages.error'));
    },
  });

  const handleSave = () => {
    saveMutation.mutate({ [idsField]: selectedIds });
  };

  const displayItems = items?.length ? items : [];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 shadow-sm space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-[var(--text-primary)]">{title}</h3>
        {!isEditing ? (
          <button type="button" className="btn btn-secondary py-1.5 px-3 text-xs" onClick={() => setIsEditing(true)}>
            <Pencil size={14} /> {t('patients.edit_profile')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button type="button" className="btn btn-primary py-1.5 px-3 text-xs" onClick={handleSave} disabled={saveMutation.isPending}>
              <Save size={14} /> {t('patients.save_profile')}
            </button>
            <button
              type="button"
              className="btn btn-secondary py-1.5 px-3 text-xs"
              onClick={() => {
                setSelectedIds(medicalProfile?.[idsField] || []);
                setIsEditing(false);
              }}
            >
              <X size={14} /> {t('common.cancel')}
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <CatalogMultiSelect endpoint={catalogEndpoint} value={selectedIds} onChange={setSelectedIds} />
      ) : displayItems.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {displayItems.map((item) => (
            <Badge key={item.id} variant="primary">
              {isRTL ? item.nameAr : item.nameEn}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-[var(--text-muted)] text-center py-8">{t('patients.no_selection')}</p>
      )}
    </div>
  );
}
