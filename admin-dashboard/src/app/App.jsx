import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../i18n';
import '../styles/globals.css';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ThemeProvider } from '../hooks/useTheme';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../routes/ProtectedRoute';
import { ROUTE_PERMISSIONS as P } from '../auth/permissions';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import PatientsPage from '../pages/PatientsPage';
import DoctorsPage from '../pages/DoctorsPage';
import SpecialitiesPage from '../pages/SpecialitiesPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import InsuranceCasesPage from '../pages/InsuranceCasesPage';
import SupportPage from '../pages/SupportPage';
import PaymentsPage from '../pages/PaymentsPage';
import ClaimsPage from '../pages/ClaimsPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import CrudPage from '../components/ui/CrudPage';
import StatusBadge from '../components/ui/StatusBadge';
import GenericDetailsPage from '../pages/GenericDetailsPage';
import UserDetailsPage from '../pages/UserDetailsPage';
import PatientDetailsPage from '../pages/PatientDetailsPage';
import DoctorDetailsPage from '../pages/DoctorDetailsPage';
import AppointmentDetailsPage from '../pages/AppointmentDetailsPage';
import InsuranceCaseDetailsPage from '../pages/InsuranceCaseDetailsPage';
import SupportTicketDetailsPage from '../pages/SupportTicketDetailsPage';
import AuditLogDetailsPage from '../pages/AuditLogDetailsPage';
import MedicalMasterDataPage from '../pages/MedicalMasterDataPage';
import RolesPage from '../pages/RolesPage';
import RoleDetailsPage from '../pages/RoleDetailsPage';
import { Info, Shield, Briefcase, FileText, Activity, CreditCard, Bell, Star, Settings, Pill, ClipboardList, Calendar, Paperclip } from 'lucide-react';

const ALL_ADMIN = ['SUPER_ADMIN', 'MEDICAL_ADMIN', 'INSURANCE_STAFF', 'SUPPORT_STAFF', 'ACCOUNTANT'];
const ADMIN_MED = ['SUPER_ADMIN', 'MEDICAL_ADMIN'];
const ADMIN_INS = ['SUPER_ADMIN', 'INSURANCE_STAFF', 'MEDICAL_ADMIN'];
const ADMIN_SUP = ['SUPER_ADMIN', 'SUPPORT_STAFF'];
const ADMIN_ACC = ['SUPER_ADMIN', 'ACCOUNTANT'];

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute roles={ALL_ADMIN}><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<ProtectedRoute permission={P.users} roles={ADMIN_MED}><UsersPage /></ProtectedRoute>} />
        <Route path="users/:id" element={<ProtectedRoute permission={P.users} roles={ADMIN_MED}><UserDetailsPage /></ProtectedRoute>} />
        
        <Route path="patients" element={<ProtectedRoute permission={P.patients} roles={[...ADMIN_MED, 'SUPPORT_STAFF']}><PatientsPage /></ProtectedRoute>} />
        <Route path="patients/:id" element={<ProtectedRoute permission={P.patients} roles={[...ADMIN_MED, 'SUPPORT_STAFF']}><PatientDetailsPage /></ProtectedRoute>} />
        
        <Route path="doctors" element={<ProtectedRoute permission={P.doctors} roles={ADMIN_MED}><DoctorsPage /></ProtectedRoute>} />
        <Route path="doctors/:id" element={<ProtectedRoute permission={P.doctors} roles={ADMIN_MED}><DoctorDetailsPage /></ProtectedRoute>} />
        
        <Route path="doctor-verification" element={<ProtectedRoute permission={P.doctors} roles={ADMIN_MED}><DoctorsPage /></ProtectedRoute>} />
        
        <Route path="specialities" element={<ProtectedRoute permission={P.specialities} roles={ADMIN_MED}><SpecialitiesPage /></ProtectedRoute>} />
        <Route path="specialities/:id" element={
          <ProtectedRoute permission={P.specialities} roles={ADMIN_MED}>
             <GenericDetailsPage 
               entityName={t('sidebar.specialities')} endpoint="/admin/specialities" titleField="nameAr"
               sections={[
                 { title: t('common.personal_info') || "المعلومات الأساسية", icon: Info, fields: [
                   { label: t('common.name_ar'), key: "nameAr" },
                   { label: t('common.name_en'), key: "nameEn" },
                   { label: t('common.sort_order') || "الترتيب", key: "sortOrder" },
                   { label: t('common.is_active'), key: "isActive", render: (v) => v ? t('common.active') : t('common.inactive') },
                 ]}
               ]}
            />
          </ProtectedRoute>
        } />

        {/* Services – full CRUD */}
        <Route path="services" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
            <CrudPage
              title={t('sidebar.services')} subtitle={t('services.manage') || 'Manage platform services'} endpoint="/admin/services" queryKey="admin-services"
              detailPath="/services"
              columns={[
                { key: 'id', label: '#' },
                { key: 'nameAr', label: t('common.name_ar') },
                { key: 'nameEn', label: t('common.name_en') },
                { key: 'type', label: t('common.type') || t('services.type') },
                { key: 'isActive', label: t('common.status'), render: (row) => row.isActive ? <span className="badge-success">{t('common.active')}</span> : <span className="badge-warning">{t('common.inactive')}</span> },
              ]}
              formFields={[
                { name: 'nameAr', label: t('common.name_ar'), required: true },
                { name: 'nameEn', label: t('common.name_en'), required: true },
                { name: 'type', label: t('common.type') || t('services.type'), type: 'select', required: true, options: [{ value: 'REMOTE', label: t('appointments.types.online') }, { value: 'HOME', label: t('appointments.types.home_visit') }, { value: 'CLINIC', label: t('appointments.types.clinic') }] },
                { name: 'descriptionAr', label: t('common.description_ar'), type: 'textarea' },
                { name: 'descriptionEn', label: t('common.description_en'), type: 'textarea' },
                { name: 'isActive', label: t('common.is_active'), type: 'boolean', defaultValue: true },
              ]}
              createLabel={t('services.add') || t('common.add_new')} editLabel={t('services.edit') || t('common.edit')}
            />
          </ProtectedRoute>
        } />
        <Route path="services/:id" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
             <GenericDetailsPage 
               entityName={t('sidebar.services')} endpoint="/admin/services" titleField="nameAr"
               sections={[
                 { title: t('services.details') || "معلومات الخدمة", icon: Briefcase, fields: [
                   { label: t('common.name_ar'), key: "nameAr" },
                   { label: t('common.name_en'), key: "nameEn" },
                   { label: t('common.type'), key: "type" },
                   { label: t('common.status'), key: "isActive", render: (v) => v ? t('common.active') : t('common.inactive') },
                   { label: t('common.description_ar'), key: "descriptionAr", fullWidth: true },
                   { label: t('common.description_en'), key: "descriptionEn", fullWidth: true },
                 ]}
               ]}
            />
          </ProtectedRoute>
        } />

        <Route path="medical-master-data" element={<ProtectedRoute permission={P.medicalMaster} roles={ADMIN_MED}><Navigate to="/medical-master-data/diseases" replace /></ProtectedRoute>} />
        <Route path="medical-master-data/:section" element={<ProtectedRoute permission={P.medicalMaster} roles={ADMIN_MED}><MedicalMasterDataPage /></ProtectedRoute>} />
        <Route path="chronic-diseases" element={<Navigate to="/medical-master-data/diseases" replace />} />
        <Route path="medications" element={<Navigate to="/medical-master-data/medications" replace />} />
        <Route path="allergies" element={<Navigate to="/medical-master-data/allergies" replace />} />
        <Route path="medical-tests" element={<Navigate to="/medical-master-data/lab-test-types" replace />} />

        <Route path="appointments" element={<ProtectedRoute permission={P.appointments} roles={ADMIN_MED}><AppointmentsPage /></ProtectedRoute>} />
        <Route path="appointments/:id" element={<ProtectedRoute permission={P.appointments} roles={ADMIN_MED}><AppointmentDetailsPage /></ProtectedRoute>} />

        {/* Insurance Providers – full CRUD */}
        <Route path="insurance-providers" element={
          <ProtectedRoute permission={P.insurance} roles={ADMIN_INS}>
            <CrudPage
              title="شركات التأمين" subtitle="إدارة شركات التأمين" endpoint="/admin/insurance-providers" queryKey="admin-insurance-providers"
              detailPath="/insurance-providers"
              columns={[
                { key: 'id', label: '#' },
                { key: 'nameAr', label: 'الاسم (عربي)' },
                { key: 'nameEn', label: 'الاسم (إنجليزي)' },
                { key: 'code', label: 'الرمز' },
                { key: 'apiMode', label: 'وضع التكامل' },
                { key: 'isActive', label: 'الحالة', render: (row) => row.isActive ? <span className="badge-success">نشط</span> : <span className="badge-warning">غير نشط</span> },
              ]}
              formFields={[
                { name: 'nameAr', label: 'الاسم بالعربي', required: true },
                { name: 'nameEn', label: 'الاسم بالإنجليزي', required: true },
                { name: 'code', label: 'الرمز', required: true },
                { name: 'apiMode', label: 'وضع التكامل', type: 'select', required: true, options: [{ value: 'MANUAL', label: 'يدوي' }, { value: 'API', label: 'تلقائي' }, { value: 'HYBRID', label: 'مختلط' }] },
                { name: 'isActive', label: 'نشط', type: 'boolean', defaultValue: true },
              ]}
              createLabel="إضافة شركة" editLabel="تعديل الشركة"
            />
          </ProtectedRoute>
        } />
        <Route path="insurance-providers/:id" element={<ProtectedRoute permission={P.insurance} roles={ADMIN_INS}><GenericDetailsPage title="تفاصيل شركة التأمين" endpoint="/admin/insurance-providers" fields={[{ label: "وضع التكامل", key: "apiMode" }, { label: "الحالة", key: "isActive", render: (v) => v ? "نشط" : "غير نشط" }]} /></ProtectedRoute>} />

        <Route path="insurance-cases" element={<ProtectedRoute permission={P.insurance} roles={ADMIN_INS}><InsuranceCasesPage /></ProtectedRoute>} />
        <Route path="insurance-cases/:id" element={<ProtectedRoute permission={P.insurance} roles={ADMIN_INS}><InsuranceCaseDetailsPage /></ProtectedRoute>} />
        
        <Route path="support/tickets/:id" element={<ProtectedRoute permission={P.support} roles={ADMIN_SUP}><SupportTicketDetailsPage /></ProtectedRoute>} />
        <Route path="support/:section" element={<ProtectedRoute permission={P.support} roles={ADMIN_SUP}><SupportPage /></ProtectedRoute>} />
        <Route path="support" element={<Navigate to="/support/tickets" replace />} />
        <Route path="support-cases" element={<Navigate to="/support/tickets" replace />} />
        <Route path="support-cases/:id" element={<ProtectedRoute permission={P.support} roles={ADMIN_SUP}><SupportTicketDetailsPage /></ProtectedRoute>} />

        {/* Lab Tests – view/edit/delete */}
        <Route path="lab-tests" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
            <CrudPage
              title={t('sidebar.medical_tests')} subtitle={t('medical.manage_tests') || "متابعة طلبات الفحوصات"} endpoint="/admin/lab-tests" queryKey="admin-lab-tests"
              canCreate={false} detailPath="/lab-tests"
              columns={[
                { key: 'id', label: '#' },
                { key: 'title', label: t('common.title') || "العنوان" },
                { key: 'patient', label: t('appointments.patient'), render: (row) => row.patient?.user?.fullName || '-' },
                { key: 'doctor', label: t('appointments.doctor'), render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'status', label: t('common.status'), render: (row) => <StatusBadge status={row.status} /> },
              ]}
              formFields={[
                { name: 'title', label: t('common.title') || "العنوان", required: true },
                { name: 'status', label: t('common.status'), type: 'select', options: [{ value: 'PENDING', label: t('status.pending') }, { value: 'SAMPLE_COLLECTED', label: t('status.sample_collected') || 'تم جمع العينة' }, { value: 'PROCESSING', label: t('status.processing') || 'قيد المعالجة' }, { value: 'COMPLETED', label: t('status.completed') }, { value: 'CANCELLED', label: t('status.cancelled') }] },
                { name: 'notes', label: t('common.notes'), type: 'textarea' },
              ]}
              editLabel={t('common.edit')} deleteConfirmMessage={t('common.confirm.delete_text')}
            />
          </ProtectedRoute>
        } />
        <Route path="lab-tests/:id" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName={t('sidebar.medical_tests')} endpoint="/admin/lab-tests" titleField="title"
              sections={[
                { title: t('medical.test_info') || "معلومات الفحص", icon: Activity, fields: [
                  { label: t('common.title') || "العنوان", key: "title" },
                  { label: t('appointments.patient'), key: "patient.user.fullName" },
                  { label: t('appointments.doctor'), key: "doctor.user.fullName" },
                  { label: t('common.status'), key: "status" },
                  { label: t('common.notes'), key: "notes", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        <Route path="payments" element={<ProtectedRoute permission={P.payments} roles={ADMIN_ACC}><PaymentsPage /></ProtectedRoute>} />
        <Route path="payments/:id" element={
          <ProtectedRoute permission={P.claims} roles={ADMIN_ACC}>
            <GenericDetailsPage 
              entityName="المدفوعات" endpoint="/admin/payments" titleField="transactionId"
              sections={[
                { title: "معلومات الدفع", icon: CreditCard, fields: [
                  { label: "رقم العملية", key: "transactionId" },
                  { label: "المبلغ", key: "amount", render: (v) => `${v} ر.س` },
                  { label: "الطريقة", key: "method" },
                  { label: "الحالة", key: "status" },
                  { label: "المستخدم", key: "user.fullName" },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />
        
        <Route path="claims" element={<ProtectedRoute permission={P.claims} roles={ADMIN_ACC}><ClaimsPage /></ProtectedRoute>} />
        <Route path="claims/:id" element={
          <ProtectedRoute permission={P.claims} roles={ADMIN_ACC}>
            <GenericDetailsPage 
              entityName="المطالبات" endpoint="/admin/claims" titleField="id"
              sections={[
                { title: "معلومات المطالبة", icon: FileText, fields: [
                  { label: "شركة التأمين", key: "claimBatch.provider.nameAr" },
                  { label: "المبلغ", key: "amount", render: (v) => `${v} ر.س` },
                  { label: "الحالة", key: "status" },
                  { label: "المريض", key: "appointment.patient.user.fullName" },
                  { label: "تاريخ الإنشاء", key: "createdAt", render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Doctor Payouts – full CRUD */}
        <Route path="doctor-payouts" element={
          <ProtectedRoute permission={P.claims} roles={ADMIN_ACC}>
            <CrudPage
              title={t('payouts.title') || "مستحقات الأطباء"} subtitle={t('payouts.subtitle') || "إدارة عمولات ومستحقات الأطباء"} endpoint="/admin/doctor-payouts" queryKey="admin-doctor-payouts"
              detailPath="/doctor-payouts"
              columns={[
                { key: 'id', label: '#' },
                { key: 'doctor', label: t('appointments.doctor'), render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'grossAmount', label: t('payouts.gross_amount') || 'المبلغ الإجمالي', render: (row) => `${row.grossAmount} ر.س` },
                { key: 'commissionAmount', label: t('payouts.commission') || 'العمولة', render: (row) => `${row.commissionAmount} ر.س` },
                { key: 'netAmount', label: t('payouts.net_amount') || 'صافي المبلغ', render: (row) => `${row.netAmount} ر.س` },
                { key: 'status', label: t('common.status'), render: (row) => <StatusBadge status={row.status} /> },
              ]}
              formFields={[
                { name: 'status', label: t('common.status'), type: 'select', required: true, options: [{ value: 'PENDING', label: t('status.pending') }, { value: 'PROCESSING', label: t('status.processing') }, { value: 'PAID', label: t('status.paid') || 'مدفوع' }, { value: 'FAILED', label: t('status.failed') || 'فشل' }] },
                { name: 'grossAmount', label: t('payouts.gross_amount') || 'المبلغ الإجمالي', type: 'number' },
                { name: 'commissionAmount', label: t('payouts.commission') || 'العمولة', type: 'number' },
                { name: 'netAmount', label: t('payouts.net_amount') || 'صافي المبلغ', type: 'number' },
              ]}
              editLabel={t('common.edit')} deleteConfirmMessage={t('common.confirm.delete_text')}
              canCreate={false}
            />
          </ProtectedRoute>
        } />
        <Route path="doctor-payouts/:id" element={
          <ProtectedRoute permission={P.claims} roles={ADMIN_ACC}>
            <GenericDetailsPage 
              entityName="مستحقات الأطباء" endpoint="/admin/doctor-payouts" titleField="id"
              sections={[
                { title: "معلومات المستحق", icon: CreditCard, fields: [
                  { label: "الطبيب", key: "doctor.user.fullName" },
                  { label: "المبلغ الإجمالي", key: "grossAmount", render: (v) => `${v} ر.س` },
                  { label: "العمولة", key: "commissionAmount", render: (v) => `${v} ر.س` },
                  { label: "صافي المبلغ", key: "netAmount", render: (v) => `${v} ر.س` },
                  { label: "الحالة", key: "status" },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Reconciliations – full CRUD */}
        <Route path="reconciliations" element={
          <ProtectedRoute permission={P.reconciliations} roles={ADMIN_ACC}>
             <CrudPage
               title={t('sidebar.reconciliations') || "التسويات"} subtitle={t('reconciliations.manage') || "إدارة تسويات المطالبات"} endpoint="/admin/reconciliations" queryKey="admin-reconciliations"
               detailPath="/reconciliations"
              columns={[
                { key: 'id', label: '#' },
                 { key: 'provider', label: t('insurance.provider'), render: (row) => row.provider?.nameAr || '-' },
                 { key: 'referenceNumber', label: t('reconciliations.reference_number') || 'رقم المرجع' },
                 { key: 'amountExpected', label: t('reconciliations.expected_amount') || 'المبلغ المتوقع', render: (row) => `${row.amountExpected} ر.س` },
                 { key: 'amountReceived', label: t('reconciliations.received_amount') || 'المبلغ المستلم', render: (row) => `${row.amountReceived} ر.س` },
                 { key: 'status', label: t('common.status'), render: (row) => <StatusBadge status={row.status} /> },
              ]}
              formFields={[
                { name: 'referenceNumber', label: 'رقم المرجع', required: true },
                { name: 'amountExpected', label: 'المبلغ المتوقع', type: 'number', required: true },
                { name: 'amountReceived', label: 'المبلغ المستلم', type: 'number', required: true },
                { name: 'status', label: 'الحالة', type: 'select', required: true, options: [{ value: 'MATCHED', label: 'متطابق' }, { value: 'DISCREPANCY', label: 'فرق' }, { value: 'PENDING', label: 'قيد الانتظار' }] },
                { name: 'notes', label: 'ملاحظات', type: 'textarea' },
              ]}
               createLabel={t('common.add_new')} editLabel={t('common.edit')}
            />
          </ProtectedRoute>
        } />
        <Route path="reconciliations/:id" element={
          <ProtectedRoute permission={P.reconciliations} roles={ADMIN_ACC}>
             <GenericDetailsPage 
               entityName={t('sidebar.reconciliations') || "التسويات"} endpoint="/admin/reconciliations" titleField="referenceNumber"
              sections={[
                 { title: t('reconciliations.details') || "معلومات التسوية", icon: FileText, fields: [
                   { label: t('insurance.provider'), key: "provider.nameAr" },
                   { label: t('reconciliations.reference_number') || 'رقم المرجع', key: "referenceNumber" },
                   { label: t('reconciliations.expected_amount') || 'المبلغ المتوقع', key: "amountExpected", render: (v) => `${v} ر.س` },
                   { label: t('reconciliations.received_amount') || 'المبلغ المستلم', key: "amountReceived", render: (v) => `${v} ر.س` },
                   { label: t('common.status'), key: "status" },
                   { label: t('common.notes'), key: "notes", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Reports – view/edit/delete */}
        <Route path="reports" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
            <CrudPage
              title={t('medical.reports')} subtitle={t('medical.all_reports') || "جميع التقارير الطبية"} endpoint="/admin/reports" queryKey="admin-reports"
              canCreate={false} detailPath="/reports"
              columns={[
                { key: 'id', label: '#' },
                { key: 'patient', label: t('appointments.patient'), render: (row) => row.patient?.user?.fullName || '-' },
                { key: 'doctor', label: t('appointments.doctor'), render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'diagnosis', label: t('medical.diagnosis'), render: (row) => (row.diagnosis || '-').substring(0, 50) },
                { key: 'date', label: t('common.created_at'), render: (row) => new Date(row.createdAt).toLocaleDateString() },
              ]}
              formFields={[
                { name: 'visitReason', label: t('medical.visit_reason') || 'سبب الزيارة', type: 'textarea' },
                { name: 'diagnosis', label: t('medical.diagnosis'), type: 'textarea' },
                { name: 'summary', label: t('common.summary'), type: 'textarea', fullWidth: true },
                { name: 'recommendations', label: t('medical.recommendations'), type: 'textarea', fullWidth: true },
                { name: 'nextAppointmentDate', label: t('medical.next_appointment'), type: 'date' },
              ]}
              editLabel={t('common.edit')} deleteConfirmMessage={t('common.confirm.delete_text')}
            />
          </ProtectedRoute>
        } />
        <Route path="reports/:id" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName={t('medical.reports')} endpoint="/admin/reports" titleField="id"
              sections={[
                { title: t('medical.report_details') || "معلومات التقرير", icon: FileText, fields: [
                  { label: t('appointments.patient'), key: "patient.user.fullName" },
                  { label: t('appointments.doctor'), key: "doctor.user.fullName" },
                  { label: t('medical.visit_reason') || 'سبب الزيارة', key: "visitReason", fullWidth: true },
                  { label: t('medical.diagnosis'), key: "diagnosis", fullWidth: true },
                  { label: t('common.summary'), key: "summary", fullWidth: true },
                  { label: t('medical.recommendations'), key: "recommendations", fullWidth: true },
                  { label: t('medical.next_appointment'), key: "nextAppointmentDate", render: (v) => v ? new Date(v).toLocaleDateString() : '-' },
                ]},
                { title: t('medical.clinical_exam') || "الفحص السريري", icon: Activity, fields: [
                  { label: "", key: "clinicalExam", fullWidth: true, render: (v) => {
                    if (!v || !Array.isArray(v)) return '-';
                    return (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--border-color)]">
                              <th className="py-2 px-4 font-semibold text-[var(--text-muted)]">{t('medical.test_type')}</th>
                              <th className="py-2 px-4 font-semibold text-[var(--text-muted)]">{t('medical.test_value')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {v.map((item, idx) => (
                              <tr key={idx} className="border-b border-[var(--border-color)] last:border-0">
                                <td className="py-2 px-4">{item.type}</td>
                                <td className="py-2 px-4 font-medium">{item.value}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }}
                ]},
                { title: t('medical.report_attachments') || "مرفقات التقرير", icon: Paperclip, fields: [
                  { label: "", key: "attachments", fullWidth: true, render: (v) => {
                    if (!v || v.length === 0) return '-';
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
                        {v.map((att, idx) => (
                          <a key={idx} href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-main)] border border-[var(--border-color)] hover:border-indigo-400 transition-colors group">
                            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                              <FileText size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{att.fileUrl.split('/').pop()}</p>
                              <p className="text-xs text-[var(--text-muted)] uppercase">{att.type}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    );
                  }}
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Prescriptions – view/edit/delete */}
        <Route path="prescriptions" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
            <CrudPage
              title={t('medical.prescriptions')} subtitle={t('medical.all_prescriptions') || "جميع الوصفات الطبية"} endpoint="/admin/prescriptions" queryKey="admin-prescriptions"
              canCreate={false} detailPath="/prescriptions"
              columns={[
                { key: 'id', label: '#' },
                { key: 'patient', label: t('appointments.patient'), render: (row) => row.patient?.user?.fullName || '-' },
                { key: 'doctor', label: t('appointments.doctor'), render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'diagnosis', label: t('medical.diagnosis'), render: (row) => (row.diagnosis || '-').substring(0, 50) },
                { key: 'items', label: t('medical.medications_count') || 'عدد الأدوية', render: (row) => row.items?.length || 0 },
                { key: 'date', label: t('common.created_at'), render: (row) => new Date(row.createdAt).toLocaleDateString() },
              ]}
              formFields={[
                { name: 'diagnosis', label: t('medical.diagnosis'), type: 'textarea' },
                { name: 'notes', label: t('common.notes'), type: 'textarea' },
              ]}
              editLabel={t('common.edit')} deleteConfirmMessage={t('common.confirm.delete_text')}
            />
          </ProtectedRoute>
        } />
        <Route path="prescriptions/:id" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName={t('medical.prescriptions')} endpoint="/admin/prescriptions" titleField="id"
              sections={[
                { title: t('medical.prescription_details') || "معلومات الوصفة", icon: Activity, fields: [
                  { label: t('appointments.patient'), key: "patient.user.fullName" },
                  { label: t('appointments.doctor'), key: "doctor.user.fullName" },
                  { label: t('medical.diagnosis'), key: "diagnosis", fullWidth: true },
                  { label: t('common.notes'), key: "notes", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Notifications – full CRUD */}
        <Route path="notifications" element={
          <ProtectedRoute permission={P.notifications} roles={['SUPER_ADMIN']}>
            <CrudPage
              title={t('sidebar.notifications') || "الإشعارات"} subtitle={t('notifications.manage') || "إدارة إشعارات النظام"} endpoint="/admin/notifications" queryKey="admin-notifications"
              detailPath="/notifications"
              columns={[
                { key: 'id', label: '#' },
                { key: 'titleAr', label: t('common.name_ar') },
                { key: 'titleEn', label: t('common.name_en') },
                { key: 'type', label: t('common.type') },
                { key: 'isRead', label: t('notifications.is_read') || 'مقروء', render: (row) => row.isRead ? t('common.yes') || 'نعم' : t('common.no') || 'لا' },
                { key: 'date', label: t('common.created_at'), render: (row) => new Date(row.createdAt).toLocaleDateString() },
              ]}
              formFields={[
                { name: 'userId', label: 'معرف المستخدم', type: 'number', required: true },
                { name: 'titleAr', label: 'العنوان بالعربي', required: true },
                { name: 'titleEn', label: 'العنوان بالإنجليزي', required: true },
                { name: 'bodyAr', label: 'المحتوى بالعربي', type: 'textarea', required: true },
                { name: 'bodyEn', label: 'المحتوى بالإنجليزي', type: 'textarea', required: true },
                { name: 'type', label: 'النوع', type: 'select', required: true, options: [{ value: 'SYSTEM', label: 'نظام' }, { value: 'APPOINTMENT', label: 'موعد' }, { value: 'PAYMENT', label: 'دفع' }, { value: 'INSURANCE', label: 'تأمين' }, { value: 'VERIFICATION', label: 'تحقق' }] },
              ]}
              createLabel="إرسال إشعار" editLabel="تعديل الإشعار"
            />
          </ProtectedRoute>
        } />
        <Route path="notifications/:id" element={
          <ProtectedRoute permission={P.notifications} roles={['SUPER_ADMIN']}>
            <GenericDetailsPage 
              entityName={t('sidebar.notifications') || "الإشعارات"} endpoint="/admin/notifications" titleField="titleAr"
              sections={[
                { title: t('notifications.content') || "محتوى الإشعار", icon: Bell, fields: [
                  { label: t('common.title_ar') || 'العنوان بالعربي', key: "titleAr" },
                  { label: t('common.title_en') || 'العنوان بالإنجليزي', key: "titleEn" },
                  { label: t('common.type'), key: "type" },
                  { label: t('notifications.is_read') || 'مقروء', key: "isRead", render: (v) => v ? t('common.yes') : t('common.no') },
                  { label: t('common.body_ar') || 'المحتوى بالعربي', key: "bodyAr", fullWidth: true },
                  { label: t('common.body_en') || 'المحتوى بالإنجليزي', key: "bodyEn", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Reviews – view/edit/delete */}
        <Route path="reviews" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
            <CrudPage
              title={t('sidebar.reviews') || "التقييمات"} subtitle={t('reviews.subtitle') || "تقييمات المرضى للأطباء"} endpoint="/admin/reviews" queryKey="admin-reviews"
              canCreate={false} detailPath="/reviews"
              columns={[
                { key: 'id', label: '#' },
                { key: 'patient', label: t('appointments.patient'), render: (row) => row.patient?.user?.fullName || '-' },
                { key: 'doctor', label: t('appointments.doctor'), render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'rating', label: t('doctors.rating'), render: (row) => `${row.rating}/5` },
                { key: 'comment', label: t('common.notes'), render: (row) => (row.comment || '-').substring(0, 60) },
                { key: 'isVisible', label: t('common.is_active'), render: (row) => row.isVisible ? t('common.yes') : t('common.no') },
              ]}
              formFields={[
                { name: 'rating', label: t('doctors.rating'), type: 'number' },
                { name: 'comment', label: t('common.notes'), type: 'textarea' },
                { name: 'isVisible', label: t('common.is_active'), type: 'boolean', defaultValue: true },
              ]}
              editLabel={t('common.edit')} deleteConfirmMessage={t('common.confirm.delete_text')}
            />
          </ProtectedRoute>
        } />
        <Route path="reviews/:id" element={
          <ProtectedRoute permission={P.services} roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName={t('sidebar.reviews') || "التقييمات"} endpoint="/admin/reviews" titleField="id"
              sections={[
                { title: t('reviews.details') || "تفاصيل التقييم", icon: Star, fields: [
                  { label: t('appointments.patient'), key: "patient.user.fullName" },
                  { label: t('appointments.doctor'), key: "doctor.user.fullName" },
                  { label: t('doctors.rating'), key: "rating", render: (v) => `${v}/5` },
                  { label: t('common.is_active'), key: "isVisible", render: (v) => v ? t('common.yes') : t('common.no') },
                  { label: t('common.notes'), key: "comment", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Settings – full CRUD */}
        <Route path="settings" element={
          <ProtectedRoute permission={P.settings} roles={['SUPER_ADMIN']}>
            <CrudPage
              title={t('sidebar.settings')} subtitle={t('settings.manage') || "إعدادات النظام"} endpoint="/admin/settings" queryKey="admin-settings"
              detailPath="/settings"
              columns={[
                { key: 'id', label: '#' },
                { key: 'key', label: t('common.key') || 'المفتاح' },
                { key: 'value', label: t('common.value') || 'القيمة' },
                { key: 'type', label: t('common.type') },
                { key: 'isPublic', label: t('common.is_public') || 'عام', render: (row) => row.isPublic ? t('common.yes') : t('common.no') },
              ]}
              formFields={[
                { name: 'key', label: t('common.key') || 'المفتاح', required: true },
                { name: 'value', label: t('common.value') || 'القيمة', required: true },
                { name: 'type', label: t('common.type'), type: 'select', required: true, options: [{ value: 'STRING', label: t('common.types.string') || 'نص' }, { value: 'NUMBER', label: t('common.types.number') || 'رقم' }, { value: 'BOOLEAN', label: t('common.types.boolean') || 'منطقي' }, { value: 'JSON', label: 'JSON' }] },
                { name: 'isPublic', label: t('common.is_public') || 'عام', type: 'boolean', defaultValue: false },
              ]}
              createLabel={t('settings.add') || "إضافة إعداد"} editLabel={t('common.edit')}
            />
          </ProtectedRoute>
        } />
        <Route path="settings/:id" element={
          <ProtectedRoute permission={P.settings} roles={['SUPER_ADMIN']}>
            <GenericDetailsPage 
              entityName={t('sidebar.settings')} endpoint="/admin/settings" titleField="key"
              sections={[
                { title: t('settings.details') || "تفاصيل الإعداد", icon: Settings, fields: [
                  { label: t('common.key') || 'المفتاح', key: "key" },
                  { label: t('common.value') || 'القيمة', key: "value" },
                  { label: t('common.type'), key: "type" },
                  { label: t('common.is_public') || 'عام', key: "isPublic", render: (v) => v ? t('common.yes') : t('common.no') },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        <Route path="roles" element={<ProtectedRoute permission={P.roles} roles={['SUPER_ADMIN']}><RolesPage /></ProtectedRoute>} />
        <Route path="roles/:id" element={<ProtectedRoute permission={P.roles} roles={['SUPER_ADMIN']}><RoleDetailsPage /></ProtectedRoute>} />

        <Route path="audit-logs" element={<ProtectedRoute permission={P.audit} roles={['SUPER_ADMIN']}><AuditLogsPage /></ProtectedRoute>} />
        <Route path="audit-logs/:id" element={<ProtectedRoute permission={P.audit} roles={['SUPER_ADMIN']}><AuditLogDetailsPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
