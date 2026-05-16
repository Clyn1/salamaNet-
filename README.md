🛡️ SalamaNet — Safety Toolkit for Kenyan Girls

Usalama wako, nguvu yako — Your safety, your strength

SalamaNet is a full-stack web application built for the Technovation Girls competition, addressing Technology-Facilitated Gender-Based Violence (TFGBV) affecting young women across Kenya. It combines AI-powered deepfake detection, emergency SOS alerts, and secure legal evidence storage into one accessible platform.

License Node React MongoDB
📋 Table of Contents

    The Problem
    Our Solution
    Features
    Tech Stack
    System Architecture
    Project Structure
    Getting Started
    Environment Variables
    API Reference
    Security
    Running Tests
    Roadmap
    The Team
    Kenya Safety Resources
    License

🌍 The Problem

In Kenya and across Sub-Saharan Africa, Technology-Facilitated Gender-Based Violence (TFGBV) is a rapidly growing crisis affecting millions of young women and girls. The forms it takes are new, fast-moving, and devastating:

    AI-generated deepfakes — fake explicit images created using a victim's real photos, used for blackmail and humiliation
    Cyberstalking — persistent online harassment, location tracking, and intimidation
    Non-consensual image sharing — intimate images shared without permission to destroy reputations
    Online threats and intimidation — coordinated abuse campaigns targeting young women

The statistics are alarming:

    Over 65% of Kenyan women aged 15–35 have experienced online harassment
    Less than 5% report it — because they don't know how, have no evidence, and feel unsupported
    The Communications Authority of Kenya received over 9,000 cybercrime reports in 2023 alone
    Existing safety tools were not built for African contexts, languages, or legal systems

Young women are suffering in silence. SalamaNet gives them a voice, a shield, and a path to justice.
💡 Our Solution

SalamaNet is a mobile-friendly web application that puts safety tools directly in the hands of the girls who need them. It works on any smartphone browser, requires no download from an app store, and is designed to be used quickly — even in a crisis.

The platform addresses TFGBV through three core actions:

    Detect — identify AI-manipulated media before it causes harm
    Alert — instantly notify trusted contacts when danger is near
    Document — build a legally valid evidence record for reporting and prosecution

✨ Features
🔐 Secure Authentication

    Email and password registration with full validation
    Passwords hashed using bcrypt with 12 salt rounds — never stored in plain text
    JWT-based authentication — secure, stateless, and expiring tokens
    Protected routes — unauthenticated users cannot access any sensitive data
    Session persistence — users stay logged in across browser refreshes

🔬 AI Deepfake Detector

    Upload images (JPG, PNG, WebP) or videos (MP4, MOV)
    Multi-factor analysis engine examining:
        Pixel frequency patterns — detects unnatural distribution in AI-generated images
        Facial landmark consistency — checks if facial proportions are humanly possible
        Compression artifact analysis — AI images compress differently from real photos
        Metadata integrity — AI images often lack camera EXIF data
        GAN fingerprint detection — identifies traces left by Generative Adversarial Networks
    Confidence score (0–100%) returned with every scan
    Results automatically saved to the Evidence Locker with timestamp
    MVP uses a rule-based simulation — designed to be replaced with a real ML model (Sightengine, Azure, or Hugging Face)

🚨 SOS Emergency Alert

    Single-button emergency trigger — works in under 2 seconds
    Real GPS location captured via browser Geolocation API
    Alert dispatched to all saved emergency contacts simultaneously
    Full alert log stored with timestamp, coordinates, and contact list
    Built-in Kenya emergency numbers always available:
        Police: 999 / 112
        Gender Violence Helpline: 0800 720 592 (free, 24/7)
        Childline Kenya: 116
        Befrienders Kenya: 0800 723 253
    Production-ready for SMS integration via Africa's Talking API

🔒 Evidence Locker

    Upload screenshots, images, PDFs, and documents
    Add descriptions documenting what happened, when, and who was involved
    Categorise by incident type: cyberstalking, deepfake, non-consensual sharing, harassment, threats
    Tamper-evident timestamps — MongoDB records creation time server-side
    All evidence isolated per user — no cross-user data access possible
    Download a formatted PDF legal report including:
        Cover page with user details and generation timestamp
        Full evidence listing with descriptions, categories, and file metadata
        Chain of custody notes for each item
        Disclaimer for court and regulatory submission
        Kenya emergency resources page

👥 Emergency Contacts Manager

    Add, edit, and remove personal emergency contacts
    Each contact stores name, phone number, and relationship
    Contacts are automatically included in every SOS alert
    Built-in Kenya helplines always visible and never removable

📱 Progressive Web App (PWA)

    Installable on Android and iOS home screens like a native app
    Offline-capable via Service Worker caching
    Works on slow or intermittent connections — critical for rural Kenya
    Offline emergency page shows direct call links to 999 and helplines

🛠️ Tech Stack
Frontend
Technology 	Version 	Purpose
React.js 	18.x 	UI framework
React Router DOM 	6.x 	Client-side routing
Axios 	1.x 	HTTP client with JWT interceptors
Context API 	Built-in 	Global authentication state
CSS3 	— 	Custom design system, no UI library
Backend
Technology 	Version 	Purpose
Node.js 	16+ 	Runtime environment
Express.js 	4.x 	REST API framework
MongoDB 	7.x 	Primary database
Mongoose 	7.x 	MongoDB object modelling
bcryptjs 	2.x 	Password hashing
jsonwebtoken 	9.x 	JWT creation and verification
Multer 	1.x 	File upload handling
PDFKit 	0.13 	Legal PDF report generation
Helmet 	7.x 	HTTP security headers
express-rate-limit 	6.x 	Brute-force protection
express-mongo-sanitize 	2.x 	NoSQL injection prevention
Morgan 	1.x 	HTTP request logging
DevOps & Testing
Technology 	Purpose
Jest 	Unit and integration testing
Supertest 	API endpoint testing
Nodemon 	Development auto-restart
Docker + Docker Compose 	Containerised local development
🏗️ System Architecture

┌─────────────────────────────────────────────────────────────┐
│                        User's Browser                        │
│                   React App (port 3000)                      │
│  Login │ Dashboard │ Detector │ SOS │ Evidence │ Profile     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP (JSON + FormData)
                           │ Authorization: Bearer <JWT>
┌──────────────────────────▼──────────────────────────────────┐
│                    Express API (port 5000)                    │
│                                                              │
│  Security Layer:                                             │
│  Helmet → Rate Limiter → Mongo Sanitizer → XSS Filter       │
│                                                              │
│  Routes:                                                     │
│  /api/auth     → Register, Login, Get profile               │
│  /api/evidence → Upload, List, Delete evidence              │
│  /api/sos      → Send alert, Get history                    │
│  /api/detector → Scan file for deepfakes                    │
│  /api/report   → Generate PDF, Get summary stats           │
│  /api/contacts → CRUD emergency contacts                    │
│                                                              │
│  Auth Middleware: JWT verify → attach req.user              │
└──────────────────────────┬──────────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼──────────────────────────────────┐
│                    MongoDB (port 27017)                       │
│                                                              │
│  Collections:                                                │
│  users      → id, name, email, passwordHash, contacts       │
│  evidences  → userId, fileName, description, timestamp      │
│  sosalerts  → userId, location, contacts, timestamp         │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│               Local File Storage (uploads/)                   │
│         Evidence files saved with unique filenames           │
└─────────────────────────────────────────────────────────────┘

📁 Project Structure

salamanet/
│
├── 📄 README.md
├── 🐳 docker-compose.yml
├── 🔒 .gitignore
│
├── backend/
│   ├── server.js                 ← Express app, security middleware, routes
│   ├── package.json
│   ├── .env.example              ← Copy to .env and fill in your values
│   ├── Dockerfile
│   │
│   ├── models/
│   │   ├── User.js               ← User schema, bcrypt pre-save hook
│   │   ├── Evidence.js           ← Evidence locker schema
│   │   └── SosAlert.js           ← SOS alert schema with contacts
│   │
│   ├── routes/
│   │   ├── auth.js               ← POST /register /login GET /me
│   │   ├── evidence.js           ← POST GET DELETE /evidence (Multer)
│   │   ├── sos.js                ← POST GET /sos
│   │   ├── detector.js           ← POST /detector/scan
│   │   ├── report.js             ← GET /report/pdf /summary (PDFKit)
│   │   └── contacts.js           ← GET POST PUT DELETE /contacts
│   │
│   ├── middleware/
│   │   ├── authMiddleware.js     ← JWT protect() guard for all routes
│   │   ├── security.js           ← Helmet, rate limiters, XSS sanitizer
│   │   └── requestLogger.js      ← Morgan HTTP logging
│   │
│   ├── utils/
│   │   ├── tokenHelper.js        ← JWT generate, verify, extract
│   │   ├── responseHelper.js     ← Standardised API response helpers
│   │   └── validators.js         ← Input validation functions
│   │
│   ├── tests/
│   │   ├── setup.js              ← Jest config, test database env vars
│   │   ├── auth.test.js          ← 9 auth integration tests
│   │   ├── evidence.test.js      ← 8 evidence tests + data isolation
│   │   ├── sos.test.js           ← 7 SOS alert tests
│   │   └── validators.test.js    ← 20 input validation unit tests
│   │
│   └── uploads/                  ← Evidence files stored here
│
└── frontend/
    ├── package.json              ← includes "proxy": "http://localhost:5000"
    ├── Dockerfile
    │
    ├── public/
    │   ├── index.html
    │   ├── manifest.json         ← PWA manifest (install on home screen)
    │   └── serviceWorker.js      ← Offline-first caching strategy
    │
    └── src/
        ├── index.js              ← React entry point, SW registration
        ├── App.js                ← Router, AuthProvider, ToastProvider
        ├── App.css               ← Global design system + CSS variables
        │
        ├── services/
        │   ├── api.js            ← Axios client, JWT interceptor, all APIs
        │   └── AuthContext.js    ← Global auth state, useAuth() hook
        │
        ├── hooks/
        │   └── useLocalStorage.js ← useLocalStorage, useDebounce,
        │                            useGeolocation, useAsync
        │
        ├── components/
        │   ├── Navbar.js/css     ← Sticky nav, pulsing SOS button
        │   ├── Toast.js/css      ← Global notifications, useToast() hook
        │   ├── Modal.js/css      ← Accessible dialog component
        │   ├── Skeleton.js/css   ← Shimmer loading placeholders
        │   ├── UploadForm.js/css ← Drag-and-drop file upload
        │   └── ContactsManager.js/css ← Full CRUD contacts UI
        │
        └── pages/
            ├── Login.js          ← Email/password sign in
            ├── Signup.js         ← Registration with validation
            ├── Auth.css          ← Shared auth page styles
            ├── Dashboard.js/css  ← Stats, quick actions, recent evidence
            ├── Detector.js/css   ← Deepfake scan with animated results
            ├── SOS.js/css        ← Emergency alert with GPS + history
            ├── EvidenceLocker.js/css ← Upload, list, delete evidence
            └── Profile.js/css    ← Account info, contacts, PDF download

🚀 Getting Started
Prerequisites

Make sure you have the following installed on your machine:

node --version    # v16.0.0 or higher required
npm --version     # v8.0.0 or higher required
mongod --version  # MongoDB 5.0 or higher required

If MongoDB is not installed:

# Ubuntu / Debian
sudo apt-get install -y mongodb
sudo systemctl start mongod
sudo systemctl enable mongod

Option A — Run with Docker (recommended)

The easiest way to get everything running — one command starts the backend, frontend, and MongoDB together:

git clone https://github.com/your-username/salamanet.git
cd salamanet
docker compose up --build

Open http://localhost:3000 in your browser.
Option B — Run manually (two terminals)

1. Clone the repository

git clone https://github.com/your-username/salamanet.git
cd salamanet

2. Set up and start the backend

cd backend
cp .env.example .env
# Open .env and fill in your values (see Environment Variables below)
npm install
npm run dev

You should see:

✅ Connected to MongoDB
🛡️  SalamaNet API → http://localhost:5000
   Health: http://localhost:5000/api/health

3. Set up and start the frontend (open a second terminal)

cd frontend
npm install
npm start

Your browser will open http://localhost:3000 automatically.

4. Create your first account

Navigate to http://localhost:3000/signup and register with your email and password.
🔑 Environment Variables

Create a .env file in the backend/ folder by copying the provided example:

cp backend/.env.example backend/.env

Open the file and set these values:

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017/salamanet

# JWT secret key — must be a long random string in production
# Generate one with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_very_long_random_secret_key_here

# Port the Express server runs on
PORT=5000

# Your frontend URL — used for CORS whitelist
CLIENT_URL=http://localhost:3000

# How long tokens stay valid
JWT_EXPIRES_IN=7d

# Environment (development or production)
NODE_ENV=development

    ⚠️ Never commit your .env file to Git. It is already listed in .gitignore to prevent accidental exposure.

📡 API Reference

All protected routes require this header with every request:

Authorization: Bearer <your_jwt_token>

Authentication
Method 	Endpoint 	Auth 	Body 	Description
POST 	/api/auth/register 	❌ 	{name, email, password} 	Create a new account
POST 	/api/auth/login 	❌ 	{email, password} 	Sign in, receive JWT token
GET 	/api/auth/me 	✅ 	— 	Get current user profile
Evidence Locker
Method 	Endpoint 	Auth 	Body 	Description
POST 	/api/evidence 	✅ 	FormData: file, description, category 	Upload new evidence
GET 	/api/evidence 	✅ 	— 	List all your evidence
GET 	/api/evidence/:id 	✅ 	— 	Get one evidence item
DELETE 	/api/evidence/:id 	✅ 	— 	Delete an evidence item
SOS Alerts
Method 	Endpoint 	Auth 	Body 	Description
POST 	/api/sos 	✅ 	{latitude, longitude, accuracy, message} 	Send emergency alert
GET 	/api/sos 	✅ 	— 	Get your alert history
Deepfake Detector
Method 	Endpoint 	Auth 	Body 	Description
POST 	/api/detector/scan 	✅ 	FormData: file 	Scan image or video
Reports
Method 	Endpoint 	Auth 	Description
GET 	/api/report/pdf 	✅ 	Download full legal PDF evidence report
GET 	/api/report/summary 	✅ 	Get account statistics summary
Emergency Contacts
Method 	Endpoint 	Auth 	Body 	Description
GET 	/api/contacts 	✅ 	— 	List all contacts
POST 	/api/contacts 	✅ 	{name, phone, relationship} 	Add a contact
PUT 	/api/contacts/:index 	✅ 	{name, phone, relationship} 	Update a contact
DELETE 	/api/contacts/:index 	✅ 	— 	Remove a contact
Example curl requests

# Register a new account
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Amara Wanjiku","email":"amara@test.com","password":"password123"}'

# Log in and save the token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"amara@test.com","password":"password123"}'

# Send an SOS alert (replace TOKEN with your actual JWT)
curl -X POST http://localhost:5000/api/sos \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"latitude":-1.2921,"longitude":36.8219,"message":"I need help!"}'

# Check the health endpoint
curl http://localhost:5000/api/health

🔒 Security

SalamaNet takes security seriously because its users are vulnerable. The following protections are active on every request:
Threat 	Protection 	How it works
Stolen passwords 	bcrypt hashing, 12 salt rounds 	Passwords never stored in plain text
Session hijacking 	JWT tokens with 7-day expiry 	Tokens signed with a private secret key
Brute-force login 	Auth rate limit: 10 req / 15 min 	Temporary IP block after too many attempts
API abuse 	Global rate limit: 100 req / 15 min 	Prevents automated scraping and flooding
Clickjacking 	X-Frame-Options header via Helmet 	Prevents embedding in malicious iframes
XSS attacks 	HTML stripped from all string inputs 	Custom middleware using the xss package
NoSQL injection 	$where / $gt operators stripped 	express-mongo-sanitize middleware
Cross-origin requests 	CORS whitelist 	Only configured frontend URL is allowed
Oversized uploads 	50MB file size limit 	Multer limits configuration
Unauthorised access 	Data isolated per user 	All queries filtered by userId
🧪 Running Tests

cd backend

# Run all 44 tests once
npm test

# Run with full coverage report
npm run test:coverage

# Run in watch mode while developing
npm run test:watch

What is tested
Test file 	Count 	Coverage
auth.test.js 	9 tests 	Register, login, JWT, duplicate email, weak password
evidence.test.js 	8 tests 	Upload, list, delete, cross-user data isolation
sos.test.js 	7 tests 	Alert creation, location fallback, history isolation
validators.test.js 	20 tests 	All input validation edge cases
Total 	44 tests 	
🗺️ Roadmap
Version 1.0 — Current MVP ✅

    User authentication with JWT and bcrypt
    Simulated deepfake detection with rule-based engine
    One-button SOS emergency alerts with GPS
    Evidence locker with file uploads and categories
    Legal PDF report export with chain of custody
    Emergency contacts management
    PWA — installable and offline-capable
    Security hardening (rate limiting, Helmet, XSS, NoSQL injection)
    44-test automated test suite

Version 1.1 — Next Steps

    Real deepfake detection via Sightengine or Hugging Face API
    SMS alerts via Africa's Talking API (Kenya-native, low cost)
    Swahili language support
    Push notifications for incoming threats
    Evidence sharing directly with legal counsel

Version 2.0 — Future Vision

    AI-powered threat severity scoring
    Direct integration with Communications Authority of Kenya portal
    Community peer support network
    School and NGO admin dashboards
    Voice-activated SOS for hands-free emergencies

👩‍💻 The Team

Built with purpose by the Technovation Girls Kenya team.

    "We built SalamaNet because we have seen what online violence does to girls around us. We wanted to build something that actually helps — not just an idea, but a real tool that works on the phones girls already have."

📞 Kenya Safety Resources
Service 	Number 	Availability
Kenya Police 	999 / 112 	24/7
Gender Violence Helpline 	0800 720 592 	24/7, free
Childline Kenya 	116 	24/7, free
Befrienders Kenya 	0800 723 253 	24/7, free
Communications Authority of Kenya 	+254 20 4242000 	Business hours
Kenya National Human Rights Commission 	+254 20 297 1000 	Business hours
📄 License

This project is licensed under the MIT License.

You are free to use, modify, and distribute this software. If you build on SalamaNet to help more girls stay safe, please consider contributing your improvements back to the community.

🛡️ SalamaNet — Usalama wako, nguvu yako

Built for Technovation Girls · Kenya · 2025
