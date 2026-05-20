# حياة بلا ألم - Backend API

## Haya Bila Alam - Healthcare & Telemedicine Platform

### Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **ORM:** Prisma
- **Validation:** Zod
- **Auth:** JWT (Access + Refresh Tokens)
- **Docs:** Swagger / OpenAPI
- **Logging:** Pino

### Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create .env from example
cp .env.example .env
# Edit .env with your database credentials

# 3. Generate Prisma Client
npm run db:generate

# 4. Run database migrations
npm run db:migrate

# 5. Seed the database
npm run db:seed

# 6. Start development server
npm run dev
```

### API Documentation
After starting the server, visit:
- **Swagger UI:** http://localhost:4000/api-docs
- **API JSON:** http://localhost:4000/api-docs.json
- **Health Check:** http://localhost:4000/health
- **Patient App Support:** [docs/PATIENT_APP_SUPPORT.md](docs/PATIENT_APP_SUPPORT.md)
- **Doctor App Support:** [docs/DOCTOR_APP_SUPPORT.md](docs/DOCTOR_APP_SUPPORT.md)

### Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@hayabilaalam.com | Password123 |
| Medical Admin | medical@hayabilaalam.com | Password123 |
| Insurance Staff | insurance@hayabilaalam.com | Password123 |
| Support Staff | support@hayabilaalam.com | Password123 |
| Accountant | accountant@hayabilaalam.com | Password123 |
| Doctor | dr.ahmed@example.com | Password123 |
| Patient | patient@example.com | Password123 |

### Project Structure

```
backend/
├── prisma/           # Database schema & seed
├── src/
│   ├── config/       # App configuration
│   ├── constants/    # Enums & constants
│   ├── middlewares/  # Express middleware
│   ├── utils/        # Helper utilities
│   ├── docs/         # Swagger setup
│   ├── shared/       # Shared services
│   │   ├── errors/
│   │   ├── responses/
│   │   ├── validators/
│   │   ├── permissions/
│   │   ├── storage/
│   │   ├── notifications/
│   │   ├── pdf/
│   │   ├── otp/
│   │   ├── payments/
│   │   ├── video/
│   │   └── insurance-integrations/
│   ├── modules/      # Feature modules (MVC + Service)
│   ├── app.js        # Express app setup
│   └── server.js     # Server entry point
├── .env.example
└── package.json
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload |
| `npm start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database |
