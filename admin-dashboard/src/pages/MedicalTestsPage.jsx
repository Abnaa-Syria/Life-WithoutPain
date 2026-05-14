import React from 'react';
import CrudPage from '../components/ui/CrudPage';
import { useTranslation } from 'react-i18next';
import Badge from '../components/ui/Badge';

export default function MedicalTestsPage() {
  const { t } = useTranslation();

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'nameAr', label: t('common.name_ar') || 'Name (AR)' },
    { key: 'nameEn', label: t('common.name_en') || 'Name (EN)' },
    { key: 'categoryAr', label: t('common.category_ar') || 'Category (AR)' },
    { 
      key: 'isActive', 
      label: t('common.status') || 'Status',
      render: (item) => (
        <Badge variant={item.isActive ? 'success' : 'secondary'}>
          {item.isActive ? t('common.active') : t('common.inactive')}
        </Badge>
      )
    },
  ];

  const formFields = [
    { name: 'nameAr', label: t('common.name_ar') || 'Name (AR)', required: true },
    { name: 'nameEn', label: t('common.name_en') || 'Name (EN)', required: true },
    { name: 'categoryAr', label: t('common.category_ar') || 'Category (AR)' },
    { name: 'categoryEn', label: t('common.category_en') || 'Category (EN)' },
    { name: 'description', label: t('common.description') || 'Description', type: 'textarea', fullWidth: true },
    { name: 'isActive', label: t('common.is_active') || 'Is Active', type: 'boolean', defaultValue: true },
  ];

  return (
    <CrudPage
      title={t('sidebar.medical_tests') || 'Medical Tests'}
      endpoint="/admin/medical-tests"
      columns={columns}
      formFields={formFields}
      queryKey="medical-tests"
    />
  );
}
