import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { ThemeProvider } from '../hooks/useTheme';
import DashboardLayout from '../layouts/DashboardLayout';
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

      <Route element={<ProtectedRoute roles={ALL_ADMIN}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<ProtectedRoute roles={ADMIN_MED}><UsersPage /></ProtectedRoute>} />
        <Route path="patients" element={<ProtectedRoute roles={[...ADMIN_MED, 'SUPPORT_STAFF']}><PatientsPage /></ProtectedRoute>} />
        <Route path="doctors" element={<ProtectedRoute roles={ADMIN_MED}><DoctorsPage /></ProtectedRoute>} />
        <Route path="doctor-verification" element={<ProtectedRoute roles={ADMIN_MED}><DoctorsPage /></ProtectedRoute>} />
        <Route path="specialities" element={<ProtectedRoute roles={ADMIN_MED}><SpecialitiesPage /></ProtectedRoute>} />

        {/* Services – full CRUD */}
        <Route path="services" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="الخدمات" subtitle="إدارة خدمات المنصة" endpoint="/admin/services" queryKey="admin-services"
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

        <Route path="appointments" element={<ProtectedRoute roles={ADMIN_MED}><AppointmentsPage /></ProtectedRoute>} />

        {/* Insurance Providers – full CRUD */}
        <Route path="insurance-providers" element={
          <ProtectedRoute roles={ADMIN_INS}>
            <CrudPage
              title="شركات التأمين" subtitle="إدارة شركات التأمين" endpoint="/admin/insurance-providers" queryKey="admin-insurance-providers"
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

        <Route path="insurance-cases" element={<ProtectedRoute roles={ADMIN_INS}><InsuranceCasesPage /></ProtectedRoute>} />
        <Route path="support-cases" element={<ProtectedRoute roles={ADMIN_SUP}><SupportCasesPage /></ProtectedRoute>} />

        {/* Lab Tests – view/edit/delete */}
        <Route path="lab-tests" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="الفحوصات المخبرية" subtitle="متابعة طلبات الفحوصات" endpoint="/admin/lab-tests" queryKey="admin-lab-tests"
              canCreate={false}
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

        <Route path="payments" element={<ProtectedRoute roles={ADMIN_ACC}><PaymentsPage /></ProtectedRoute>} />
        <Route path="claims" element={<ProtectedRoute roles={ADMIN_ACC}><ClaimsPage /></ProtectedRoute>} />

        {/* Doctor Payouts – full CRUD */}
        <Route path="doctor-payouts" element={
          <ProtectedRoute roles={ADMIN_ACC}>
            <CrudPage
              title="مستحقات الأطباء" subtitle="إدارة عمولات ومستحقات الأطباء" endpoint="/admin/doctor-payouts" queryKey="admin-doctor-payouts"
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

        {/* Reconciliations – full CRUD */}
        <Route path="reconciliations" element={
          <ProtectedRoute roles={ADMIN_ACC}>
            <CrudPage
              title="التسويات" subtitle="إدارة تسويات المطالبات" endpoint="/admin/reconciliations" queryKey="admin-reconciliations"
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

        {/* Reports – view/edit/delete */}
        <Route path="reports" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="التقارير الطبية" subtitle="جميع التقارير الطبية" endpoint="/admin/reports" queryKey="admin-reports"
              canCreate={false}
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

        {/* Prescriptions – view/edit/delete */}
        <Route path="prescriptions" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="الوصفات الطبية" subtitle="جميع الوصفات الطبية" endpoint="/admin/prescriptions" queryKey="admin-prescriptions"
              canCreate={false}
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

        {/* Notifications – full CRUD */}
        <Route path="notifications" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <CrudPage
              title="الإشعارات" subtitle="إدارة إشعارات النظام" endpoint="/admin/notifications" queryKey="admin-notifications"
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

        {/* Reviews – view/edit/delete */}
        <Route path="reviews" element={
          <ProtectedRoute roles={ADMIN_MED}>
            <CrudPage
              title="التقييمات" subtitle="تقييمات المرضى للأطباء" endpoint="/admin/reviews" queryKey="admin-reviews"
              canCreate={false}
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

        {/* Settings – full CRUD */}
        <Route path="settings" element={
          <ProtectedRoute roles={['SUPER_ADMIN']}>
            <CrudPage
              title="الإعدادات" subtitle="إعدادات النظام" endpoint="/admin/settings" queryKey="admin-settings"
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

        <Route path="audit-logs" element={<ProtectedRoute roles={['SUPER_ADMIN']}><AuditLogsPage /></ProtectedRoute>} />
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
