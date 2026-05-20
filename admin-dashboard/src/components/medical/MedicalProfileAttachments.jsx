import React, { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import FilePreviewer from '../ui/FilePreviewer';
import toast from 'react-hot-toast';
import { Upload, Trash2 } from 'lucide-react';

export default function MedicalProfileAttachments({ patientId, attachments = [] }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const uploadMutation = useMutation({
    mutationFn: (files) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));
      return api.post(`/admin/patients/${patientId}/medical-profile/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient', String(patientId)] });
      toast.success(t('messages.saved'));
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('messages.error'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (attachmentId) =>
      api.delete(`/admin/patients/${patientId}/medical-profile/attachments/${attachmentId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['patient', String(patientId)] });
      toast.success(t('messages.deleted'));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || t('messages.error'));
    },
  });

  const previewFiles = attachments.map((a) => ({
    url: a.fileUrl,
    name: a.title,
    mimeType: a.mimeType,
    id: a.id,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h4 className="text-sm font-bold text-[var(--text-muted)]">{t('patients.report_attachments')}</h4>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) uploadMutation.mutate(e.target.files);
            }}
          />
          <button
            type="button"
            className="btn btn-secondary py-1.5 px-3 text-xs"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            <Upload size={14} /> {t('common.upload') || 'Upload'}
          </button>
        </div>
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((a) => (
            <button
              key={a.id}
              type="button"
              className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20"
              onClick={() => {
                if (window.confirm(t('common.confirm_delete') || 'Delete this file?')) {
                  deleteMutation.mutate(a.id);
                }
              }}
              disabled={deleteMutation.isPending}
            >
              <Trash2 size={12} /> {a.title}
            </button>
          ))}
        </div>
      )}

      <FilePreviewer files={previewFiles} height="500px" />
    </div>
  );
}
