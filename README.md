# MicroFinance — Passbook Ledger

A full-stack Micro Finance Management System built with the MERN stack.

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 + lucide-react + recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas (Cluster0) + Mongoose ODM |
| Auth | JWT (7-day) + bcrypt PIN hashing |

## Project Structure

```
micro-finance-0.1/
├── src/                    ← React frontend (Passbook Ledger UI)
│   ├── components/         ← Card, Stamp, TopBar, BottomNav, Sidebar, ...
│   ├── screens/            ← 8 screens: Login, Dashboard, Loans, ...
│   ├── data/               ← Mock data (replaced by API calls)
│   └── theme.js            ← Light/dark design tokens
├── server/                 ← Express API
│   ├── config/db.js        ← MongoDB Atlas connection (Stable API v1)
│   ├── models/             ← User, Customer, Loan, Payment, Notification
│   ├── controllers/        ← Business logic (7 controllers)
│   ├── routes/             ← REST endpoints
│   ├── middleware/         ← JWT auth, role guard, error handler
│   └── utils/              ← Token gen, async handler, cron jobs, seeder
├── index.html
├── vite.config.js
└── README.md
```

## Setup

### Prerequisites
- Node.js ≥ 18
- MongoDB Atlas account (or use the provided Cluster0)

### Frontend

```bash
npm install
npm run dev          # → http://localhost:5173
```

### Backend

```bash
cd server
cp .env.example .env
# Edit .env — add your MONGO_URI password and JWT_SECRET
npm install
npm run dev          # → http://localhost:5000
```

### Environment Variables (`server/.env`)

```env
MONGO_URI=mongodb+srv://gayanchanuka823_db_user:<password>@cluster0.2xk0lxp.mongodb.net/microfinance?appName=Cluster0
JWT_SECRET=your_long_random_secret
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Seed Sample Data

```bash
cd server
npm run seed
# Prints login credentials for admin + agents
```

### Vite Dev Proxy (avoids CORS)

Add to `vite.config.js`:
```js
server: { proxy: { '/api': 'http://localhost:5000' } }
```

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Phone + PIN → JWT |
| POST | `/api/auth/register` | Admin | Create agent |
| GET | `/api/customers` | Token | List + search + pagination |
| POST | `/api/customers` | Token | Create customer |
| GET | `/api/loans` | Token | List + `?type=&status=` filters |
| POST | `/api/loans` | Token | Create loan |
| GET | `/api/payments/today` | Token | Daily collection list |
| POST | `/api/payments` | Token | Record payment → auto-updates loan |
| GET | `/api/reports/summary` | Token | Dashboard stats |
| GET | `/api/reports/trend` | Token | Monthly chart data |
| GET | `/api/reports/breakdown` | Token | Pie chart data |
| GET | `/api/health` | Public | Server health check |

## Design System — Passbook Ledger

- **Fonts**: Poppins (headings) · Inter (body) · IBM Plex Mono (amounts)
- **Themes**: Full light/dark switching via a single JS token object
- **Ink-stamp badges**: Rotated −4° status pills with color ring shadow
- **Mobile-first**: Bottom tab bar < 1024px · Sidebar ≥ 1024px

## License

MIT
