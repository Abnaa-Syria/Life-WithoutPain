# حياة بلا ألم - لوحة الإدارة

## Haya Bila Alam - Admin Dashboard

### Stack
- **Framework:** React 19
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State:** TanStack Query
- **Forms:** React Hook Form + Zod
- **Routing:** React Router v7
- **HTTP:** Axios
- **Icons:** Lucide React

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env
cp .env.example .env

# 3. Start development server
npm run dev
```

Dashboard will be available at http://localhost:5173

### Features
- Arabic-first RTL interface
- Almarai font
- Dark mode support
- Role-based navigation and access control
- Responsive design
- Real-time data with TanStack Query

### Role-Based Access
| Role | Access Areas |
|------|-------------|
| Super Admin | Full access to all sections |
| Medical Admin | Patients, Doctors, Appointments, Reports |
| Insurance Staff | Insurance cases, Providers |
| Support Staff | Support cases, Patient lookup |
| Accountant | Payments, Claims, Payouts, Reconciliation |
