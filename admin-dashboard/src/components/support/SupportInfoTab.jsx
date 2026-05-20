import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import Card from '../ui/Card';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';

export default function SupportInfoTab() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm();

  const { data: response, isLoading } = useQuery({
    queryKey: ['admin-support-info'],
    queryFn: () => api.get('/admin/support/info').then((r) => r.data),
  });

  useEffect(() => {
    const info = response?.data;
    if (!info) return;
    reset({
      supportEmail: info.supportEmail || '',
      whatsappNumber: info.whatsappNumber || '',
      whatsappLink: info.whatsappLink || '',
      supportPhones: Array.isArray(info.supportPhones) ? info.supportPhones.join('\n') : '',
      facebook: info.socialLinks?.facebook || '',
      instagram: info.socialLinks?.instagram || '',
      twitter: info.socialLinks?.twitter || '',
      workingHoursAr: info.workingHours?.ar || '',
      workingHoursEn: info.workingHours?.en || '',
      descriptionAr: info.descriptionAr || '',
      descriptionEn: info.descriptionEn || '',
    });
  }, [response, reset]);

  const saveMutation = useMutation({
    mutationFn: (form) => {
      const payload = {
        supportEmail: form.supportEmail,
        whatsappNumber: form.whatsappNumber || null,
        whatsappLink: form.whatsappLink || null,
        supportPhones: form.supportPhones
          .split('\n')
          .map((p) => p.trim())
          .filter(Boolean),
        socialLinks: {
          facebook: form.facebook || '',
          instagram: form.instagram || '',
          twitter: form.twitter || '',
        },
        workingHours: {
          ar: form.workingHoursAr || '',
          en: form.workingHoursEn || '',
        },
        descriptionAr: form.descriptionAr || null,
        descriptionEn: form.descriptionEn || null,
      };
      return api.patch('/admin/support/info', payload);
    },
    onSuccess: () => {
      toast.success(t('messages.saved'));
      qc.invalidateQueries(['admin-support-info']);
    },
    onError: () => toast.error(t('messages.error')),
  });

  if (isLoading) {
    return <Card><p className="p-6 text-[var(--text-muted)]">{t('common.loading')}</p></Card>;
  }

  return (
    <Card>
      <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="p-6 space-y-6 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('support.info.email')}</label>
            <input type="email" className="input" {...register('supportEmail', { required: true })} />
          </div>
          <div>
            <label className="label">{t('support.info.whatsapp')}</label>
            <input className="input" {...register('whatsappNumber')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">{t('support.info.whatsapp_link')}</label>
            <input className="input" {...register('whatsappLink')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">{t('support.info.phones')}</label>
            <textarea className="input h-24 py-2" placeholder="+966..." {...register('supportPhones')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Facebook</label>
            <input className="input" {...register('facebook')} />
          </div>
          <div>
            <label className="label">Instagram</label>
            <input className="input" {...register('instagram')} />
          </div>
          <div>
            <label className="label">Twitter</label>
            <input className="input" {...register('twitter')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">{t('support.info.hours_ar')}</label>
            <input className="input" {...register('workingHoursAr')} />
          </div>
          <div>
            <label className="label">{t('support.info.hours_en')}</label>
            <input className="input" {...register('workingHoursEn')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">{t('support.info.description_ar')}</label>
            <textarea className="input h-28 py-2" {...register('descriptionAr')} />
          </div>
          <div className="md:col-span-2">
            <label className="label">{t('support.info.description_en')}</label>
            <textarea className="input h-28 py-2" {...register('descriptionEn')} />
          </div>
        </div>

        <button type="submit" disabled={saveMutation.isPending} className="btn btn-primary">
          {saveMutation.isPending ? t('common.saving') : t('common.save')}
        </button>
      </form>
    </Card>
  );
}
