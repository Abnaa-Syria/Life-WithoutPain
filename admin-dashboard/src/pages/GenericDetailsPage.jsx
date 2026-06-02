import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import { useTranslation } from 'react-i18next';
import DetailsHeader from '../components/ui/DetailsHeader';
import DetailsSection from '../components/ui/DetailsSection';
import DetailItem from '../components/ui/DetailItem';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import Badge from '../components/ui/Badge';
import { Info, FileText, Clock, Settings } from 'lucide-react';

const GenericDetailsPage = ({ 
  entityName, 
  endpoint, 
  titleField = 'id', 
  sections = [], 
  backPath,
  topContent,
  bottomContent,
}) => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: response, isLoading, error } = useQuery({
    queryKey: [entityName, id],
    queryFn: () => api.get(`${endpoint}/${id}`).then(res => res.data),
    enabled: !!id
  });

  if (isLoading) return <LoadingSkeleton type="table" />; // Table skeleton is better than nothing
  if (error) return <div className="p-8 text-center text-red-500">{t('messages.error')}</div>;

  const data = response?.data;
  if (!data) return <div className="p-8 text-center">{t('common.not_found')}</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DetailsHeader 
        title={data[titleField] || `#${id}`}
        subtitle={entityName}
        backPath={backPath}
        badges={data.status ? [{ label: t(`status.${data.status.toLowerCase()}`) || data.status, className: 'bg-primary-100 text-primary-700' }] : []}
      />

      <div className="space-y-6">
        {typeof topContent === 'function' ? topContent(data) : topContent}

        {sections.map((section, sIdx) => (
          <DetailsSection key={sIdx} title={section.title} icon={section.icon}>
            {section.fields.map((field, fIdx) => {
              const value = field.key.split('.').reduce((obj, key) => obj?.[key], data);
              return (
              <DetailItem 
                key={fIdx} 
                label={field.label} 
                value={value}
                render={field.render ? (v) => field.render(v, data) : undefined}
                fullWidth={field.fullWidth}
              />
            );})}
          </DetailsSection>
        ))}

        {typeof bottomContent === 'function' ? bottomContent(data) : bottomContent}

        {/* Audit Info Section */}
        <DetailsSection title={t('common.audit_info') || 'Audit Information'} icon={Clock}>
          <DetailItem 
            label={t('common.created_at') || 'Created At'} 
            value={data.createdAt ? new Date(data.createdAt).toLocaleString() : '-'} 
          />
          <DetailItem 
            label={t('common.updated_at') || 'Updated At'} 
            value={data.updatedAt ? new Date(data.updatedAt).toLocaleString() : '-'} 
          />
          {data.id && <DetailItem label={t('common.internal_id') || 'Internal ID'} value={data.id} />}
        </DetailsSection>
      </div>
    </div>
  );
};

export default GenericDetailsPage;
