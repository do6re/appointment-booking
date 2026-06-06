# Appointment Booking System

Modernes Terminbuchungssystem für Entrümpelungsdienste mit React, TypeScript, Node.js und PostgreSQL.

## 🎯 Features

- ✅ Benutzerfreundlicher Terminkalender
- ✅ Verfügbarkeitsverwaltung nach Wochentagen
- ✅ Automatische E-Mail-Bestätigung
- ✅ Admin-Dashboard zur Terminverwaltung
- ✅ Responsive Design für Mobil & Desktop
- ✅ PostgreSQL Datenbank
- ✅ Docker-Support

## 📋 Erforderliche Informationen bei Buchung

- Name
- E-Mail
- Datum
- Zeitpunkt
- Art der Dienstleistung (Entrümpelung, Haushalt, Garten, etc.)

## 🚀 Quick Start

### Voraussetzungen
- Node.js 16+
- PostgreSQL 12+
- Docker & Docker Compose (optional)

### Installation

```bash
# Repository klonen
git clone https://github.com/do6re/appointment-booking.git
cd appointment-booking

# Abhängigkeiten installieren
cd backend && npm install
cd ../frontend && npm install

# .env Datei erstellen
cp backend/.env.example backend/.env

# Datenbank initialisieren
cd backend
npm run db:migrate

# Server starten
npm run dev

# Frontend in neuer Shell starten
cd frontend
npm start
```

### Mit Docker

```bash
docker-compose up -d
```

Die Anwendung läuft dann unter:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📁 Projektstruktur

```
apointment-booking/
├── frontend/              # React TypeScript App
│   ├── src/
│   │   ├── components/   # React Komponenten
│   │   ├── pages/        # Seiten
│   │   ├── services/     # API Services
│   │   └── styles/       # Styling
│   └── package.json
├── backend/              # Node.js Express Server
│   ├── src/
│   │   ├── routes/       # API Routes
│   │   ├── controllers/  # Business Logic
│   │   ├── models/       # Database Models
│   │   └── middleware/   # Middleware
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 Umgebungsvariablen

### Backend (.env)
```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/appointment_booking
NODE_ENV=development
JWT_SECRET=your-secret-key
EMAIL_FROM=noreply@entrumpelungservice.de
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🗄️ Datenbank Schema

### appointments
- id (UUID)
- name (VARCHAR)
- email (VARCHAR)
- date (DATE)
- time (TIME)
- service_type (VARCHAR)
- status (ENUM: pending, confirmed, cancelled)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)

### availability
- id (UUID)
- day_of_week (INT: 0-6)
- start_time (TIME)
- end_time (TIME)
- slot_duration_minutes (INT)

### services
- id (UUID)
- name (VARCHAR)
- description (TEXT)
- duration_minutes (INT)
- active (BOOLEAN)

## 📧 E-Mail-Benachrichtigungen

- ✅ Buchungsbestätigung an Kunde
- ✅ Neue Buchung an Admin
- ✅ Stornierungsbestätigung
- ✅ Erinnerung 24h vor Termin

## 🛡️ Sicherheit

- Input Validation
- CORS Protection
- Rate Limiting
- JWT Authentication für Admin
- SQL Injection Protection

## 📝 API Endpoints

### Public
- `GET /api/services` - Liste aller Dienstleistungen
- `GET /api/availability` - Verfügbare Zeitslots
- `POST /api/appointments` - Neuen Termin buchen
- `GET /api/appointments/:id` - Termindetails

### Admin (geschützt)
- `GET /api/admin/appointments` - Alle Termine
- `PUT /api/admin/appointments/:id` - Termin aktualisieren
- `DELETE /api/admin/appointments/:id` - Termin löschen
- `POST /api/admin/availability` - Verfügbarkeit setzen

## 🎨 Design

- Modernes, sauberes Interface
- Responsive Layout (Mobile-First)
- Intuitive Bedienung
- Professionelle Farben und Typographie

## 📜 Lizenz

MIT

## 👨‍💻 Support

Bei Fragen oder Problemen: GitHub Issues
