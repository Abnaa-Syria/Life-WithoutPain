import { Routes, Route, Navigate } from 'react-router-dom';
import '../i18n';
import '../styles/globals.css';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ThemeProvider } from '../hooks/useTheme';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../routes/ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import PatientsPage from '../pages/PatientsPage';
import DoctorsPage from '../pages/DoctorsPage';
import SpecialitiesPage from '../pages/SpecialitiesPage';
import AppointmentsPage from '../pages/AppointmentsPage';
import InsuranceCasesPage from '../pages/InsuranceCasesPage';
import SupportCasesPage from '../pages/SupportCasesPage';
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
import SupportCaseDetailsPage from '../pages/SupportCaseDetailsPage';
import AuditLogDetailsPage from '../pages/AuditLogDetailsPage';
import { Info, Shield, Briefcase, FileText, Activity, CreditCard, Bell, Star, Settings } from 'lucide-react';

const ALL_ADMIN = ['SUPER_ADMIN', 'MEDICAL_ADMIN', 'INSURANCE_STAFF', 'SUPPORT_STAFF', 'ACCOUNTANT'];
const ADMIN_MED = ['SUPER_ADMIN', 'MEDICAL_ADMIN'];
const ADMIN_INS = ['SUPER_ADMIN', 'INSURANCE_STAFF', 'MEDICAL_ADMIN'];
const ADMIN_SUP = ['SUPER_ADMIN', 'SUPPORT_STAFF'];
const ADMIN_ACC = ['SUPER_ADMIN', 'ACCOUNTANT'];

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute roles={ALL_ADMIN}><AppLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<ProtectedRoute roles={ADMIN_MED}><UsersPage /></ProtectedRoute>} />
        <Route path="users/:id" element={<ProtectedRoute roles={ADMIN_MED}><UserDetailsPage /></ProtectedRoute>} />
        
        <Route path="patients" element={<ProtectedRoute roles={[...ADMIN_MED, 'SUPPORT_STAFF']}><PatientsPage /></ProtectedRoute>} />
        <Route path="patients/:id" element={<ProtectedRoute roles={[...ADMIN_MED, 'SUPPORT_STAFF']}><PatientDetailsPage /></ProtectedRoute>} />
        
        <Route path="doctors" element={<ProtectedRoute roles={ADMIN_MED}><DoctorsPage /></ProtectedRoute>} />
        <Route path="doctors/:id" element={<ProtectedRoute roles={ADMIN_MED}><DoctorDetailsPage /></ProtectedRoute>} />
        
        <Route path="doctor-verification" element={<ProtectedRoute roles={ADMIN_MED}><DoctorsPage /></ProtectedRoute>} />
        
        <Route path="specialities" element={<ProtectedRoute roles={ADMIN_MED}><SpecialitiesPage /></ProtectedRoute>} />
        <Route path="specialities/:id" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName="التخصصات" endpoint="/admin/specialities" titleField="nameAr"
              sections={[
                { title: "المعلومات الأساسية", icon: Info, fields: [
                  { label: "الاسم بالعربي", key: "nameAr" },
                  { label: "الاسم بالإنجليزي", key: "nameEn" },
                  { label: "الترتيب", key: "sortOrder" },
                  { label: "نشط", key: "isActive", render: (v) => v ? "نعم" : "لا" },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Services – full CRUD */}
        <Route path="services" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="الخدمات" subtitle="إدارة خدمات المنصة" endpoint="/admin/services" queryKey="admin-services"
              detailPath="/services"
              columns={[
                { key: 'id', label: '#' },
                { key: 'nameAr', label: 'الاسم (عربي)' },
                { key: 'nameEn', label: 'الاسم (إنجليزي)' },
                { key: 'type', label: 'النوع' },
                { key: 'isActive', label: 'الحالة', render: (row) => row.isActive ? <span className="badge-success">نشط</span> : <span className="badge-warning">غير نشط</span> },
              ]}
              formFields={[
                { name: 'nameAr', label: 'الاسم بالعربي', required: true },
                { name: 'nameEn', label: 'الاسم بالإنجليزي', required: true },
                { name: 'type', label: 'النوع', type: 'select', required: true, options: [{ value: 'REMOTE', label: 'عن بعد' }, { value: 'HOME', label: 'منزلي' }, { value: 'CLINIC', label: 'عيادة' }] },
                { name: 'descriptionAr', label: 'الوصف بالعربي', type: 'textarea' },
                { name: 'descriptionEn', label: 'الوصف بالإنجليزي', type: 'textarea' },
                { name: 'isActive', label: 'نشط', type: 'boolean', defaultValue: true },
              ]}
              createLabel="إضافة خدمة" editLabel="تعديل الخدمة"
            />
          </ProtectedRoute>
        } />
        <Route path="services/:id" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName="الخدمات" endpoint="/admin/services" titleField="nameAr"
              sections={[
                { title: "معلومات الخدمة", icon: Briefcase, fields: [
                  { label: "الاسم بالعربي", key: "nameAr" },
                  { label: "الاسم بالإنجليزي", key: "nameEn" },
                  { label: "النوع", key: "type" },
                  { label: "الحالة", key: "isActive", render: (v) => v ? "نشط" : "غير نشط" },
                  { label: "الوصف بالعربي", key: "descriptionAr", fullWidth: true },
                  { label: "الوصف بالإنجليزي", key: "descriptionEn", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        <Route path="appointments" element={<ProtectedRoute roles={ADMIN_MED}><AppointmentsPage /></ProtectedRoute>} />
        <Route path="appointments/:id" element={<ProtectedRoute roles={ADMIN_MED}><AppointmentDetailsPage /></ProtectedRoute>} />

        {/* Insurance Providers – full CRUD */}
        <Route path="insurance-providers" element={
          <ProtectedRoute roles={ADMIN_INS}>
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
        <Route path="insurance-providers/:id" element={
          <ProtectedRoute roles={ADMIN_INS}>
            <GenericDetailsPage 
              entityName="شركات التأمين" endpoint="/admin/insurance-providers" titleField="nameAr"
              sections={[
                { title: "معلومات الشركة", icon: Shield, fields: [
                  { label: "الاسم بالعربي", key: "nameAr" },
                  { label: "الاسم بالإنجليزي", key: "nameEn" },
                  { label: "الرمز", key: "code" },
                  { label: "وضع التكامل", key: "apiMode" },
                  { label: "الحالة", key: "isActive", render: (v) => v ? "نشط" : "غير نشط" },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        <Route path="insurance-cases" element={<ProtectedRoute roles={ADMIN_INS}><InsuranceCasesPage /></ProtectedRoute>} />
        <Route path="insurance-cases/:id" element={<ProtectedRoute roles={ADMIN_INS}><InsuranceCaseDetailsPage /></ProtectedRoute>} />
        
        <Route path="support-cases" element={<ProtectedRoute roles={ADMIN_SUP}><SupportCasesPage /></ProtectedRoute>} />
        <Route path="support-cases/:id" element={<ProtectedRoute roles={ADMIN_SUP}><SupportCaseDetailsPage /></ProtectedRoute>} />

        {/* Lab Tests – view/edit/delete */}
        <Route path="lab-tests" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="الفحوصات المخبرية" subtitle="متابعة طلبات الفحوصات" endpoint="/admin/lab-tests" queryKey="admin-lab-tests"
              canCreate={false} detailPath="/lab-tests"
              columns={[
                { key: 'id', label: '#' },
                { key: 'title', label: 'العنوان' },
                { key: 'patient', label: 'المريض', render: (row) => row.patient?.user?.fullName || '-' },
                { key: 'doctor', label: 'الطبيب', render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'status', label: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
              ]}
              formFields={[
                { name: 'title', label: 'العنوان', required: true },
                { name: 'status', label: 'الحالة', type: 'select', options: [{ value: 'PENDING', label: 'قيد الانتظار' }, { value: 'SAMPLE_COLLECTED', label: 'تم جمع العينة' }, { value: 'PROCESSING', label: 'قيد المعالجة' }, { value: 'COMPLETED', label: 'مكتمل' }, { value: 'CANCELLED', label: 'ملغي' }] },
                { name: 'notes', label: 'ملاحظات', type: 'textarea' },
              ]}
              editLabel="تعديل الفحص" deleteConfirmMessage="هل أنت متأكد من حذف هذا الفحص؟"
            />
          </ProtectedRoute>
        } />
        <Route path="lab-tests/:id" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName="الفحوصات المخبرية" endpoint="/admin/lab-tests" titleField="title"
              sections={[
                { title: "معلومات الفحص", icon: Activity, fields: [
                  { label: "العنوان", key: "title" },
                  { label: "المريض", key: "patient.user.fullName" },
                  { label: "الطبيب", key: "doctor.user.fullName" },
                  { label: "الحالة", key: "status" },
                  { label: "ملاحظات", key: "notes", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        <Route path="payments" element={<ProtectedRoute roles={ADMIN_ACC}><PaymentsPage /></ProtectedRoute>} />
        <Route path="payments/:id" element={
          <ProtectedRoute roles={ADMIN_ACC}>
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
        
        <Route path="claims" element={<ProtectedRoute roles={ADMIN_ACC}><ClaimsPage /></ProtectedRoute>} />
        <Route path="claims/:id" element={
          <ProtectedRoute roles={ADMIN_ACC}>
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
          <ProtectedRoute roles={ADMIN_ACC}>
            <CrudPage
              title="مستحقات الأطباء" subtitle="إدارة عمولات ومستحقات الأطباء" endpoint="/admin/doctor-payouts" queryKey="admin-doctor-payouts"
              detailPath="/doctor-payouts"
              columns={[
                { key: 'id', label: '#' },
                { key: 'doctor', label: 'الطبيب', render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'grossAmount', label: 'المبلغ الإجمالي', render: (row) => `${row.grossAmount} ر.س` },
                { key: 'commissionAmount', label: 'العمولة', render: (row) => `${row.commissionAmount} ر.س` },
                { key: 'netAmount', label: 'صافي المبلغ', render: (row) => `${row.netAmount} ر.س` },
                { key: 'status', label: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
              ]}
              formFields={[
                { name: 'status', label: 'الحالة', type: 'select', required: true, options: [{ value: 'PENDING', label: 'قيد الانتظار' }, { value: 'PROCESSING', label: 'قيد المعالجة' }, { value: 'PAID', label: 'مدفوع' }, { value: 'FAILED', label: 'فشل' }] },
                { name: 'grossAmount', label: 'المبلغ الإجمالي', type: 'number' },
                { name: 'commissionAmount', label: 'العمولة', type: 'number' },
                { name: 'netAmount', label: 'صافي المبلغ', type: 'number' },
              ]}
              editLabel="تعديل المستحق" deleteConfirmMessage="هل أنت متأكد من حذف هذا المستحق؟"
              canCreate={false}
            />
          </ProtectedRoute>
        } />
        <Route path="doctor-payouts/:id" element={
          <ProtectedRoute roles={ADMIN_ACC}>
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
          <ProtectedRoute roles={ADMIN_ACC}>
            <CrudPage
              title="التسويات" subtitle="إدارة تسويات المطالبات" endpoint="/admin/reconciliations" queryKey="admin-reconciliations"
              detailPath="/reconciliations"
              columns={[
                { key: 'id', label: '#' },
                { key: 'provider', label: 'شركة التأمين', render: (row) => row.provider?.nameAr || '-' },
                { key: 'referenceNumber', label: 'رقم المرجع' },
                { key: 'amountExpected', label: 'المبلغ المتوقع', render: (row) => `${row.amountExpected} ر.س` },
                { key: 'amountReceived', label: 'المبلغ المستلم', render: (row) => `${row.amountReceived} ر.س` },
                { key: 'status', label: 'الحالة', render: (row) => <StatusBadge status={row.status} /> },
              ]}
              formFields={[
                { name: 'referenceNumber', label: 'رقم المرجع', required: true },
                { name: 'amountExpected', label: 'المبلغ المتوقع', type: 'number', required: true },
                { name: 'amountReceived', label: 'المبلغ المستلم', type: 'number', required: true },
                { name: 'status', label: 'الحالة', type: 'select', required: true, options: [{ value: 'MATCHED', label: 'متطابق' }, { value: 'DISCREPANCY', label: 'فرق' }, { value: 'PENDING', label: 'قيد الانتظار' }] },
                { name: 'notes', label: 'ملاحظات', type: 'textarea' },
              ]}
              createLabel="إضافة تسوية" editLabel="تعديل التسوية"
            />
          </ProtectedRoute>
        } />
        <Route path="reconciliations/:id" element={
          <ProtectedRoute roles={ADMIN_ACC}>
            <GenericDetailsPage 
              entityName="التسويات" endpoint="/admin/reconciliations" titleField="referenceNumber"
              sections={[
                { title: "معلومات التسوية", icon: FileText, fields: [
                  { label: "شركة التأمين", key: "provider.nameAr" },
                  { label: "رقم المرجع", key: "referenceNumber" },
                  { label: "المبلغ المتوقع", key: "amountExpected", render: (v) => `${v} ر.س` },
                  { label: "المبلغ المستلم", key: "amountReceived", render: (v) => `${v} ر.س` },
                  { label: "الحالة", key: "status" },
                  { label: "ملاحظات", key: "notes", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Reports – view/edit/delete */}
        <Route path="reports" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="التقارير الطبية" subtitle="جميع التقارير الطبية" endpoint="/admin/reports" queryKey="admin-reports"
              canCreate={false} detailPath="/reports"
              columns={[
                { key: 'id', label: '#' },
                { key: 'patient', label: 'المريض', render: (row) => row.patient?.user?.fullName || '-' },
                { key: 'doctor', label: 'الطبيب', render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'diagnosis', label: 'التشخيص', render: (row) => (row.diagnosis || '-').substring(0, 50) },
                { key: 'date', label: 'التاريخ', render: (row) => new Date(row.createdAt).toLocaleDateString('ar-SA') },
              ]}
              formFields={[
                { name: 'visitReason', label: 'سبب الزيارة', type: 'textarea' },
                { name: 'diagnosis', label: 'التشخيص', type: 'textarea' },
                { name: 'summary', label: 'الملخص', type: 'textarea', fullWidth: true },
                { name: 'recommendations', label: 'التوصيات', type: 'textarea', fullWidth: true },
              ]}
              editLabel="تعديل التقرير" deleteConfirmMessage="هل أنت متأكد من حذف هذا التقرير؟"
            />
          </ProtectedRoute>
        } />
        <Route path="reports/:id" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName="التقارير الطبية" endpoint="/admin/reports" titleField="id"
              sections={[
                { title: "معلومات التقرير", icon: FileText, fields: [
                  { label: "المريض", key: "patient.user.fullName" },
                  { label: "الطبيب", key: "doctor.user.fullName" },
                  { label: "سبب الزيارة", key: "visitReason", fullWidth: true },
                  { label: "التشخيص", key: "diagnosis", fullWidth: true },
                  { label: "الملخص", key: "summary", fullWidth: true },
                  { label: "التوصيات", key: "recommendations", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Prescriptions – view/edit/delete */}
        <Route path="prescriptions" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="الوصفات الطبية" subtitle="جميع الوصفات الطبية" endpoint="/admin/prescriptions" queryKey="admin-prescriptions"
              canCreate={false} detailPath="/prescriptions"
              columns={[
                { key: 'id', label: '#' },
                { key: 'patient', label: 'المريض', render: (row) => row.patient?.user?.fullName || '-' },
                { key: 'doctor', label: 'الطبيب', render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'diagnosis', label: 'التشخيص', render: (row) => (row.diagnosis || '-').substring(0, 50) },
                { key: 'items', label: 'عدد الأدوية', render: (row) => row.items?.length || 0 },
                { key: 'date', label: 'التاريخ', render: (row) => new Date(row.createdAt).toLocaleDateString('ar-SA') },
              ]}
              formFields={[
                { name: 'diagnosis', label: 'التشخيص', type: 'textarea' },
                { name: 'notes', label: 'ملاحظات', type: 'textarea' },
              ]}
              editLabel="تعديل الوصفة" deleteConfirmMessage="هل أنت متأكد من حذف هذه الوصفة؟"
            />
          </ProtectedRoute>
        } />
        <Route path="prescriptions/:id" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName="الوصفات الطبية" endpoint="/admin/prescriptions" titleField="id"
              sections={[
                { title: "معلومات الوصفة", icon: Activity, fields: [
                  { label: "المريض", key: "patient.user.fullName" },
                  { label: "الطبيب", key: "doctor.user.fullName" },
                  { label: "التشخيص", key: "diagnosis", fullWidth: true },
                  { label: "ملاحظات", key: "notes", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Notifications – full CRUD */}
        <Route path="notifications" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <CrudPage
              title="الإشعارات" subtitle="إدارة إشعارات النظام" endpoint="/admin/notifications" queryKey="admin-notifications"
              detailPath="/notifications"
              columns={[
                { key: 'id', label: '#' },
                { key: 'titleAr', label: 'العنوان (عربي)' },
                { key: 'titleEn', label: 'العنوان (إنجليزي)' },
                { key: 'type', label: 'النوع' },
                { key: 'isRead', label: 'مقروء', render: (row) => row.isRead ? 'نعم' : 'لا' },
                { key: 'date', label: 'التاريخ', render: (row) => new Date(row.createdAt).toLocaleDateString('ar-SA') },
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
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <GenericDetailsPage 
              entityName="الإشعارات" endpoint="/admin/notifications" titleField="titleAr"
              sections={[
                { title: "محتوى الإشعار", icon: Bell, fields: [
                  { label: "العنوان بالعربي", key: "titleAr" },
                  { label: "العنوان بالإنجليزي", key: "titleEn" },
                  { label: "النوع", key: "type" },
                  { label: "مقروء", key: "isRead", render: (v) => v ? "نعم" : "لا" },
                  { label: "المحتوى بالعربي", key: "bodyAr", fullWidth: true },
                  { label: "المحتوى بالإنجليزي", key: "bodyEn", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Reviews – view/edit/delete */}
        <Route path="reviews" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="التقييمات" subtitle="تقييمات المرضى للأطباء" endpoint="/admin/reviews" queryKey="admin-reviews"
              canCreate={false} detailPath="/reviews"
              columns={[
                { key: 'id', label: '#' },
                { key: 'patient', label: 'المريض', render: (row) => row.patient?.user?.fullName || '-' },
                { key: 'doctor', label: 'الطبيب', render: (row) => row.doctor?.user?.fullName || '-' },
                { key: 'rating', label: 'التقييم', render: (row) => `${row.rating}/5` },
                { key: 'comment', label: 'التعليق', render: (row) => (row.comment || '-').substring(0, 60) },
                { key: 'isVisible', label: 'مرئي', render: (row) => row.isVisible ? 'نعم' : 'لا' },
              ]}
              formFields={[
                { name: 'rating', label: 'التقييم', type: 'number' },
                { name: 'comment', label: 'التعليق', type: 'textarea' },
                { name: 'isVisible', label: 'مرئي', type: 'boolean', defaultValue: true },
              ]}
              editLabel="تعديل التقييم" deleteConfirmMessage="هل أنت متأكد من حذف هذا التقييم؟"
            />
          </ProtectedRoute>
        } />
        <Route path="reviews/:id" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <GenericDetailsPage 
              entityName="التقييمات" endpoint="/admin/reviews" titleField="id"
              sections={[
                { title: "تفاصيل التقييم", icon: Star, fields: [
                  { label: "المريض", key: "patient.user.fullName" },
                  { label: "الطبيب", key: "doctor.user.fullName" },
                  { label: "التقييم", key: "rating", render: (v) => `${v}/5` },
                  { label: "مرئي", key: "isVisible", render: (v) => v ? "نعم" : "لا" },
                  { label: "التعليق", key: "comment", fullWidth: true },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        {/* Settings – full CRUD */}
        <Route path="settings" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <CrudPage
              title="الإعدادات" subtitle="إعدادات النظام" endpoint="/admin/settings" queryKey="admin-settings"
              detailPath="/settings"
              columns={[
                { key: 'id', label: '#' },
                { key: 'key', label: 'المفتاح' },
                { key: 'value', label: 'القيمة' },
                { key: 'type', label: 'النوع' },
                { key: 'isPublic', label: 'عام', render: (row) => row.isPublic ? 'نعم' : 'لا' },
              ]}
              formFields={[
                { name: 'key', label: 'المفتاح', required: true },
                { name: 'value', label: 'القيمة', required: true },
                { name: 'type', label: 'النوع', type: 'select', required: true, options: [{ value: 'STRING', label: 'نص' }, { value: 'NUMBER', label: 'رقم' }, { value: 'BOOLEAN', label: 'منطقي' }, { value: 'JSON', label: 'JSON' }] },
                { name: 'isPublic', label: 'عام', type: 'boolean', defaultValue: false },
              ]}
              createLabel="إضافة إعداد" editLabel="تعديل الإعداد"
            />
          </ProtectedRoute>
        } />
        <Route path="settings/:id" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <GenericDetailsPage 
              entityName="الإعدادات" endpoint="/admin/settings" titleField="key"
              sections={[
                { title: "تفاصيل الإعداد", icon: Settings, fields: [
                  { label: "المفتاح", key: "key" },
                  { label: "القيمة", key: "value" },
                  { label: "النوع", key: "type" },
                  { label: "عام", key: "isPublic", render: (v) => v ? "نعم" : "لا" },
                ]}
              ]}
            />
          </ProtectedRoute>
        } />

        <Route path="audit-logs" element={<ProtectedRoute roles={['SUPER_ADMIN']}><AuditLogsPage /></ProtectedRoute>} />
        <Route path="audit-logs/:id" element={<ProtectedRoute roles={['SUPER_ADMIN']}><AuditLogDetailsPage /></ProtectedRoute>} />
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
