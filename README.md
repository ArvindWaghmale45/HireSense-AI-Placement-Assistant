# 🚀 HireSense — AI Placement & Interview Preparation Platform

<div align="center">

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Your Intelligent AI-Powered Edge for Campus & Off-Campus Technical Placements.**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Project Structure](#-project-structure) • [Getting Started](#-getting-started) • [REST API](#-backend-rest-api-specification)

</div>

---

## 📌 Overview

**HireSense** is a comprehensive, full-stack placement preparation and mock interview platform designed specifically for students and early-career software engineers. It bridges the gap between theoretical knowledge and real-world placement selection by simulating end-to-end recruitment drives:

- **Live Video Interview Simulation**: Real-time webcam candidate stream with automated examiner audio playback.
- **Far-Field Voice Recognition**: Resilient speech-to-text with auto-gain amplification and Indian English / US English accent support.
- **Google Gemini Multimodal Evaluation**: Audio byte and text analysis delivering instant scores (1–10), key strengths, missed technical concepts, and model answers.
- **Resume Analyzer**: ATS readiness scanner detecting key skills, formatting gaps, and job-fit benchmarks.
- **AI Career Assistant**: 24/7 placement mentor answering questions about DSA, OOP, System Design, and HR scenarios.

---

## 🏗️ System Architecture

HireSense follows a modern full-stack decoupled architecture organized as a clean monorepo:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HIRESENSE CLIENT (React 19)                    │
│                                                                        │
│   [ Live Webcam Stream ]       [ Far-Field Speech Engine ]             │
│        (navigator.mediaDevices)     (Web Speech API + Web Audio API)    │
│                                                                        │
│   [ Dashboard & Analytics ]    [ AI Placement Assistant ]              │
│        (Recharts & Lucide UI)        (Gemini Flash Multimodal)         │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ JSON REST APIs
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   HIRESENSE BACKEND (Java Spring Boot 3)               │
│                                                                        │
│   [ Security & JWT Filter ]     [ Controllers: Auth, Interview, Prep ]  │
│                                                                        │
│   [ Business Service Layer ]    [ Spring Data JPA Repositories ]       │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    DATABASE & EXTERNAL SERVICES                        │
│                                                                        │
│   [ PostgreSQL / MySQL DB ]     [ Google Gemini 1.5 Flash API ]         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. 🎙️ Live Video & Voice Mock Interview
- **Real-Time Webcam Feed**: Candidate webcam preview with live recording watermark, camera flip, and mic controls.
- **Far-Field Audio & Noise Suppression**: Built on Web Audio API `AudioContext` with `autoGainControl: true`, picking up candidate voices even from 2–3 feet back.
- **Live Sound Wave Equalizer**: Real-time animated volume visualizer confirming microphone sensitivity.
- **Indian & Global English Accents**: Seamlessly switch between `en-IN` and `en-US` speech recognition.
- **AI Refine Spoken Answer**: One-click multimodal audio transcription using Google Gemini to eliminate technical term spelling errors.
- **Text-to-Speech Examiner**: Reads questions aloud using browser speech synthesis to replicate a real recruitment room.

### 2. 📊 Skill Matrix & Readiness Analytics
- Visual radar/progress breakdowns across **Core Java**, **Data Structures & Algorithms**, **Database Management (SQL)**, **System Design**, and **HR Aptitude**.
- Historical interview score tracking with pass/fail evaluation and examiner critique.

### 3. 📄 AI Resume Analyzer
- Scan candidate resume content for keywords, placement strengths, missing skills, and overall ATS placement score.

### 4. 🤖 AI Career Assistant
- Chat with an AI mentor specialized in Java Full Stack interview questions, coding patterns, and HR behavioral preparation.

---

## 📂 Project Structure

```
HireSense/
├── frontend/                        # React SPA (Vite + Tailwind CSS + React Router)
│   ├── public/                      # Static assets (favicons, manifest)
│   ├── src/
│   │   ├── components/              # AppShell and reusable UI components (.jsx)
│   │   │   └── ui/                  # Clean JavaScript UI components (.jsx)
│   │   ├── hooks/                   # Custom React Hooks:
│   │   │   ├── useMediaStream.js    # Live webcam video stream & permissions
│   │   │   ├── useAudioRecorder.js  # High-sensitivity audio capture & dB meter
│   │   │   ├── useSpeechRecognition.js # Continuous voice-to-text without duplication
│   │   │   └── useAuth.jsx          # Session state & authentication
│   │   ├── lib/
│   │   │   ├── api/                 # API client services (ai.js, interviews.js, auth.js)
│   │   │   └── data/                # Curated question bank (Java, SQL, DSA, HR)
│   │   ├── pages/                   # Application views:
│   │   │   ├── Interview.jsx        # Live Video Mock Interview suite
│   │   │   ├── Dashboard.jsx        # Candidate analytics & progress overview
│   │   │   ├── Prepare.jsx          # Category practice rounds & quiz bank
│   │   │   ├── ResumeAnalyzer.jsx   # Resume ATS scanner & evaluation
│   │   │   ├── SkillAnalysis.jsx    # Skill proficiency matrix
│   │   │   ├── Assistant.jsx        # 24/7 AI career chat assistant
│   │   │   ├── Login.jsx            # User sign in with auto-redirect
│   │   │   ├── Register.jsx         # Candidate onboarding
│   │   │   └── Landing.jsx          # Public product landing page
│   │   ├── App.jsx                  # Main router config
│   │   ├── main.jsx                 # Client entry point
│   │   └── styles.css               # Design tokens & animations
│   ├── package.json                 # Frontend dependencies & scripts
│   ├── vite.config.js               # Vite bundler configuration
│   └── jsconfig.json                # Path alias (@/* -> src/*)
│
├── backend/                         # Java Spring Boot 3 application (Coming Next)
│   ├── src/main/java/com/hiresense/
│   │   ├── controller/              # REST Controllers (Auth, Interview, Prep, Resume)
│   │   ├── service/                 # Business logic & AI service integration
│   │   ├── repository/              # Spring Data JPA interfaces
│   │   ├── model/                   # JPA Entities (User, Interview, Question, Attempt)
│   │   └── config/                  # Security, JWT, CORS configuration
│   ├── src/main/resources/
│   │   └── application.yml          # Spring & Database configuration
│   └── pom.xml                      # Maven project dependencies
│
├── .gitignore                       # Repository-wide ignore rules
├── package.json                     # Monorepo root scripts
└── README.md                        # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher ([Download Node.js](https://nodejs.org/))
- **Java JDK**: `21` (or `17+`) ([Download OpenJDK](https://adoptium.net/))
- **Maven**: `3.9+` (for backend)

---

### Running the Frontend

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ArvindWaghmale45/HireSense-AI-Placement-Assistant.git
   cd HireSense-AI-Placement-Assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install --prefix frontend
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   > The application will start at: **`http://localhost:5173/`**

4. **Build for production**:
   ```bash
   npm run build
   ```

---

### Configuring Google Gemini AI (Free)

HireSense comes with built-in intelligent fallback evaluation. To enable live multimodal AI question generation and audio transcription:
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Launch HireSense and open **Mock Interview**.
3. Click **"Add Free AI Key"** and paste your key. It will be stored securely in your local browser session.

---

## 📡 Backend REST API Specification

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student candidate account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate & return JWT token | ❌ No |
| `GET` | `/api/auth/me` | Fetch authenticated profile & stats | ✅ Yes |
| `GET` | `/api/interviews` | List completed interviews for user | ✅ Yes |
| `POST` | `/api/interviews` | Save interview responses & AI evaluation | ✅ Yes |
| `GET` | `/api/prep/questions` | Fetch questions filtered by category & difficulty | ✅ Yes |
| `POST` | `/api/prep/submit` | Submit single question practice attempt | ✅ Yes |
| `POST` | `/api/resume/analyze` | Submit resume text for ATS feedback | ✅ Yes |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons, Radix UI, Recharts, Sonner.
- **Speech & Audio**: Web Audio API `AudioContext` with Auto-Gain & Noise Suppression, Web Speech Recognition (`webkitSpeechRecognition`), Google Gemini 1.5 Flash Multimodal Audio.
- **Backend**: Java 21, Spring Boot 3.3, Spring Security (JWT), Spring Data JPA.
- **Database**: PostgreSQL 16 / MySQL 8.

---

## 👨‍💻 Author

Developed by **Arvind Waghmale** as part of the Java Full Stack Placement Preparation Project.
- GitHub: [@ArvindWaghmale45](https://github.com/ArvindWaghmale45)
- Project: [HireSense-AI-Placement-Assistant](https://github.com/ArvindWaghmale45/HireSense-AI-Placement-Assistant)

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
