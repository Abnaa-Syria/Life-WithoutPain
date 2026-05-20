import React, { useMemo } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Info, Headphones } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Tabs from '../components/ui/Tabs';
import SupportInfoTab from '../components/support/SupportInfoTab';
import SupportTicketsTab from '../components/support/SupportTicketsTab';
import {
  DEFAULT_SUPPORT_SECTION,
  SUPPORT_SECTIONS,
  getSupportSection,
  isValidSupportSection,
} from '../config/supportSections';

const SECTION_ICONS = { Info, Headphones };

export default function SupportPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { section: sectionParam } = useParams();
  const activeSection = sectionParam || DEFAULT_SUPPORT_SECTION;

  const tabs = useMemo(
    () =>
      SUPPORT_SECTIONS.map((s) => ({
        id: s.id,
        label: t(s.translationKey),
        icon: SECTION_ICONS[s.icon],
      })),
    [t],
  );

  if (!isValidSupportSection(activeSection)) {
    return <Navigate to={`/support/${DEFAULT_SUPPORT_SECTION}`} replace />;
  }

  const sectionMeta = getSupportSection(activeSection);

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('sidebar.support')}
        breadcrumbs={[
          { label: t('sidebar.dashboard'), path: '/' },
          { label: t('sidebar.support'), path: `/support/${activeSection}` },
        ]}
      />

      <Tabs
        tabs={tabs}
        activeTab={activeSection}
        onChange={(id) => navigate(`/support/${id}`)}
      />

      {sectionMeta?.id === 'info' && <SupportInfoTab />}
      {sectionMeta?.id === 'tickets' && <SupportTicketsTab />}
    </div>
  );
}
