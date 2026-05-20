import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HeartPulse, Pill, AlertTriangle, ClipboardList } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Tabs from '../components/ui/Tabs';
import CrudPage from '../components/ui/CrudPage';
import Badge from '../components/ui/Badge';
import {
  DEFAULT_MEDICAL_MASTER_DATA_SECTION,
  MEDICAL_MASTER_DATA_SECTIONS,
  getMedicalMasterDataSection,
  isValidMedicalMasterDataSection,
} from '../config/medicalMasterDataSections';

const SECTION_ICONS = {
  HeartPulse,
  Pill,
  AlertTriangle,
  ClipboardList,
};

function useCatalogCrudConfig(t, variant) {
  const statusColumn = {
    key: 'isActive',
    label: t('common.status') || 'Status',
    render: (item) => (
      <Badge variant={item.isActive ? 'success' : 'secondary'}>
        {item.isActive ? t('common.active') : t('common.inactive')}
      </Badge>
    ),
  };

  const baseColumns = [
    { key: 'id', label: 'ID' },
    { key: 'nameAr', label: t('common.name_ar') || 'Name (AR)' },
    { key: 'nameEn', label: t('common.name_en') || 'Name (EN)' },
    statusColumn,
  ];

  const baseFormFields = [
    { name: 'nameAr', label: t('common.name_ar') || 'Name (AR)', required: true },
    { name: 'nameEn', label: t('common.name_en') || 'Name (EN)', required: true },
    { name: 'description', label: t('common.description') || 'Description', type: 'textarea', fullWidth: true },
    { name: 'isActive', label: t('common.is_active') || 'Is Active', type: 'boolean', defaultValue: true },
  ];

  if (variant === 'labTest') {
    return {
      columns: [
        ...baseColumns.slice(0, 3),
        { key: 'categoryAr', label: t('common.category_ar') || 'Category (AR)' },
        statusColumn,
      ],
      formFields: [
        ...baseFormFields.slice(0, 2),
        { name: 'categoryAr', label: t('common.category_ar') || 'Category (AR)' },
        { name: 'categoryEn', label: t('common.category_en') || 'Category (EN)' },
        ...baseFormFields.slice(2),
      ],
    };
  }

  return { columns: baseColumns, formFields: baseFormFields };
}

export default function MedicalMasterDataPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { section: sectionParam } = useParams();
  const activeSection = sectionParam || DEFAULT_MEDICAL_MASTER_DATA_SECTION;

  const tabs = useMemo(
    () =>
      MEDICAL_MASTER_DATA_SECTIONS.map((s) => ({
        id: s.id,
        label: t(s.translationKey),
        icon: SECTION_ICONS[s.icon],
      })),
    [t],
  );

  const sectionMeta = getMedicalMasterDataSection(activeSection);
  const { columns, formFields } = useCatalogCrudConfig(t, sectionMeta?.variant);

  if (sectionParam && !isValidMedicalMasterDataSection(sectionParam)) {
    return <Navigate to={`/medical-master-data/${DEFAULT_MEDICAL_MASTER_DATA_SECTION}`} replace />;
  }

  const masterLabel = t('medical_master_data.title');
  const sectionLabel = sectionMeta ? t(sectionMeta.translationKey) : '';

  const breadcrumbs = [
    { label: t('sidebar.dashboard'), path: '/' },
    { label: masterLabel, path: `/medical-master-data/${DEFAULT_MEDICAL_MASTER_DATA_SECTION}` },
    { label: sectionLabel, path: `/medical-master-data/${activeSection}` },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <PageHeader
        title={masterLabel}
        breadcrumbs={breadcrumbs}
      />

      <p className="text-sm text-[var(--text-muted)] -mt-4 max-w-3xl">
        {t('medical_master_data.subtitle')}
      </p>

      <Tabs
        tabs={tabs}
        activeTab={activeSection}
        onChange={(id) => navigate(`/medical-master-data/${id}`)}
      />

      {sectionMeta && (
        <CrudPage
          key={sectionMeta.id}
          embedded
          title={sectionLabel}
          endpoint={sectionMeta.endpoint}
          queryKey={sectionMeta.queryKey}
          columns={columns}
          formFields={formFields}
          breadcrumbs={breadcrumbs}
          createLabel={t('medical_master_data.add_item', { item: sectionLabel })}
          editLabel={t('medical_master_data.edit_item', { item: sectionLabel })}
        />
      )}
    </div>
  );
}
