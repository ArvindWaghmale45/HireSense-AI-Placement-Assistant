# 🚀 HireSense — AI Campus Placement & Technical Interview Preparation Platform

<div align="center">

<img src="frontend/public/hiresense-logo.png" alt="HireSense Logo" width="120" style="border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />

### *Empowering Engineering Students & Freshers to Ace Campus Recruitment Drives*

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.3-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

[Features](#-key-features) • [Architecture](#-system-architecture) • [Placement Arena](#-placement-aptitude--mock-test-arena) • [Getting Started](#-getting-started) • [Deployment](#-production-deployment-guide) • [REST API](#-backend-rest-api-specification)

</div>

---

## 📌 Executive Overview

**HireSense** is an enterprise-grade full-stack placement preparation ecosystem designed for university students, campus recruitment aspirants, and junior software engineers. It simulates end-to-end recruitment drives of top product and service MNCs (such as **Google, Microsoft, Amazon, TCS Digital/Ninja, Infosys Power Programmer, Wipro Turbo, Cognizant, and Capgemini**).

HireSense bridges the gap between college curricula and real-world placement selection:
- **Real-Time Video & Voice Mock Interviews**: Webcam streaming, far-field voice capture with noise cancellation, examiner speech synthesis, and live answer scoring.
- **Multimodal AI Evaluation**: Powered by Google Gemini 1.5 Flash to evaluate spoken answers, provide strengths, and identify missing technical concepts.
- **Dynamic Placement Aptitude & Technical Arena**: A rich question bank, multi-test curated catalog, and on-demand AI aptitude test generator with continuous shuffling.
- **ATS Resume Analyzer**: Instantly parses candidate resumes to extract key competencies and generate placement readiness scores.
- **24/7 AI Career Mentor**: On-demand interview mentor for DSA, Java, Spring Boot, SQL, and HR behavioral preparation.
- **Universal Dark/Light Theme**: Seamless, persistent theme toggle with smooth animated transitions.

---

## 🏗️ System Architecture

HireSense is structured as a decoupled monorepo featuring a high-performance React 19 single-page application and a robust Java Spring Boot 3 micro-backend:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        HIRESENSE CLIENT (React 19)                    │
│                                                                        │
│   [ Live Webcam Stream ]       [ Far-Field Speech Engine ]             │
│        (navigator.mediaDevices)     (Web Speech API + Web Audio API)    │
│                                                                        │
│   [ Placement Test Arena ]     [ AI Test Generator & Flashcards ]      │
│        (Fisher-Yates Shuffler)      (Gemini AI Synthesis + Local Bank) │
│                                                                        │
│   [ Dark/Light Theme Engine ]  [ ATS Resume Analyzer ]                 │
│        (Tailwind v4 OKLCH)          (PDF/Text Keyword Parser)          │
└─────────────────────────────────┬──────────────────────────────────────┘
                                  │ JSON REST APIs (JWT Auth / CORS)
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
│                    DATABASE & EXTERNAL CLOUD SERVICES                  │
│                                                                        │
│   [ MySQL / H2 Database ]       [ Google Gemini 1.5 Multimodal API ]   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 1. 🎙️ Live Video & Voice Technical Interview Suite
- **Webcam Feed with Candidate Preview**: Real-time video preview with camera flip and mute toggles.
- **Far-Field Voice Engine**: Built on Web Audio API `AudioContext` with `autoGainControl: true` and noise suppression to pick up natural candidate responses from 2–3 feet away.
- **Sound Wave Visualizer**: Live audio equalization bars giving instant visual feedback when the candidate speaks.
- **Text-to-Speech Examiner**: Reads questions aloud using browser speech synthesis in natural English accents.
- **Multimodal AI Answer Scoring**: Google Gemini evaluates candidate answers on a strict 1–10 scale, highlighting:
  - Key concepts covered.
  - Critical points to improve.
  - Ideal model answers for review.

### 2. 🎯 Placement Aptitude & Mock Test Arena
- **Comprehensive Question Bank**: 48+ verified campus placement questions spanning:
  - **Quantitative Aptitude**: Time & Work, Speed & Distance, Train Problems, Profit & Loss, Compound Interest, Probability, Permutations & Combinations, Ratios, and Ages.
  - **Logical Reasoning**: Number/Letter Series, Blood Relations, Coding-Decoding, Syllogisms, Direction Sense, Clocks & Angles, and Calendars.
  - **Verbal Ability**: Sentence Correction, Error Spotting, Idioms & Phrases, Synonyms, and Antonyms.
  - **Core Technical**: Java Memory Management, Collections, JVM Architecture, Multithreading, SQL Joins & Indexing, ACID Properties, React Internals, and OS Concepts.
- **Guaranteed Dynamic Shuffling**: Powered by the Fisher-Yates algorithm, questions and options are randomized every time a test runs or restarts.
- **Multi-Test Curated Catalog**: Pre-configured timed assessments (Quantitative Sprint, Logical Arena, Verbal Skills, Core Java, Full Stack DBMS, and Campus All-Rounder).
- **On-Demand AI Test Generator**: Synthesize brand new placement tests on any topic, difficulty, or MNC pattern (TCS NQT, Infosys, Wipro, Cognizant, Capgemini, Amazon) using Google Gemini, with automatic local fallback.
- **Persistent Test Catalog**: Generated AI tests are automatically saved into your personal "All Tests" catalog so you can retake and practice them anytime.

### 3. 📄 ATS Resume Analyzer
- Scan and evaluate PDF, DOCX, or TXT resumes.
- Automatically extract skills, experience levels, and recommend targeted improvements to pass corporate ATS filters.

### 4. 🤖 AI Career Assistant
- 24/7 placement mentor answering technical questions, code walkthroughs, and HR STAR-method behavioral preparation.

### 5. 🌓 Dual Theme Experience
- Instant, persistent Dark Mode & Light Mode toggle with zero-flicker reload script and micro-animations.

---

## 📂 Project Structure

```
HireSense/
├── frontend/                        # React SPA (Vite + React 19 + Tailwind CSS v4)
│   ├── public/                      # Brand assets (hiresense-logo.png, favicon.svg)
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── AppShell.jsx         # App shell layout with header navigation
│   │   │   ├── HireSenseLogo.jsx    # Unified brand logo component
│   │   │   ├── ThemeToggle.jsx      # Animated Dark/Light mode switch
│   │   │   └── ui/                  # UI primitives (Cards, Buttons, Dialogs, Tabs)
│   │   ├── hooks/                   # Custom React Hooks:
│   │   │   ├── useTheme.jsx         # Dark/Light theme state & persistence
│   │   │   ├── useAuth.jsx          # Session state & JWT authentication
│   │   │   ├── useMediaStream.js    # Live webcam video stream & permissions
│   │   │   └── useAudioRecorder.js  # Audio capture & decibel meter
│   │   ├── lib/
│   │   │   ├── api/                 # API client layers (ai.js, prep.js, interviews.js)
│   │   │   └── data/                # Placement question banks (48+ verified MCQs & HR)
│   │   ├── pages/                   # Application views:
│   │   │   ├── Landing.jsx          # Public product landing page
│   │   │   ├── Prepare.jsx          # Placement Test Arena & AI Generator
│   │   │   ├── Interview.jsx        # Live Video/Voice Mock Interview room
│   │   │   ├── Dashboard.jsx        # Candidate analytics & progress tracker
│   │   │   ├── ResumeAnalyzer.jsx   # ATS Resume scanner & suggestions
│   │   │   ├── SkillAnalysis.jsx    # Skill proficiency matrix
│   │   │   ├── Assistant.jsx        # 24/7 AI chat assistant
│   │   │   ├── Login.jsx            # User sign-in
│   │   │   └── Register.jsx         # User registration with resume auto-fill
│   │   ├── App.jsx                  # Main router config & theme providers
│   │   ├── main.jsx                 # Client entry point
│   │   └── styles.css               # Tailwind v4 theme design tokens (OKLCH)
│   ├── package.json                 # Frontend dependencies
│   └── vite.config.js               # Vite configuration & dev server proxy
│
├── backend/                         # Java 21 Spring Boot 3 Micro-backend
│   ├── src/main/java/com/hiresense/
│   │   ├── controller/              # REST Controllers (Auth, Interview, Health, TTS)
│   │   ├── service/                 # Business logic & AI processing
│   │   ├── repository/              # Spring Data JPA interfaces
│   │   ├── model/                   # JPA Entities (User, Interview, Attempt)
│   │   └── security/                # Spring Security, JWT token filters, CORS
│   ├── src/main/resources/
│   │   └── application.yml          # Spring profiles, H2/MySQL connection configs
│   ├── pom.xml                      # Maven build configuration
│   └── mvnw.cmd / mvnw              # Maven wrappers
│
├── package.json                     # Monorepo root scripts
└── README.md                        # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.x` or higher ([Download Node.js](https://nodejs.org/))
- **Java JDK**: `21` (or `17+`) ([Download OpenJDK](https://adoptium.net/))

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/ArvindWaghmale45/HireSense-AI-Placement-Assistant.git
cd HireSense-AI-Placement-Assistant
```

---

### Step 2: Run the Frontend (React + Vite)
```bash
# Install frontend dependencies
npm install --prefix frontend

# Start the Vite development server
npm run dev
```
> The frontend will launch at: **`http://localhost:5173`**

---

### Step 3: Run the Backend (Spring Boot 3)
In a new terminal window:
```bash
# On Windows PowerShell:
cd backend
.\mvnw.cmd spring-boot:run

# On macOS/Linux:
cd backend
./mvnw spring-boot:run
```
> The Spring Boot REST API will start at: **`http://localhost:8080`**

---

### Step 4: Configure Free Google Gemini AI (Optional)
HireSense includes automatic offline fallback banks for both interview evaluation and aptitude generation. To enable real-time Gemini AI:
1. Obtain a free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. In the app, open **Mock Interview** or **Generate AI Test**.
3. Click **"Add Free AI Key"** and paste your key. It is saved in your local browser session.

---

## 🌐 Production Deployment Guide

### Deploying the Frontend (Vercel)
1. Push your code to your GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Import `HireSense-AI-Placement-Assistant`.
4. Set the **Root Directory** to `frontend`.
5. Set the **Build Command** to `npm run build` and **Output Directory** to `dist`.
6. Click **Deploy**. Vercel will provide a live production URL (e.g., `https://hiresense.vercel.app`) with automatic SSL.

### Deploying the Backend (Render / Railway)
1. Sign in to [Render](https://render.com) or [Railway](https://railway.app).
2. Create a new **Web Service** and connect this repository.
3. Configure the settings:
   - **Root Directory**: `backend`
   - **Environment**: Java 21 / Docker
   - **Build Command**: `./mvnw clean package -DskipTests`
   - **Start Command**: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
4. In your frontend `.env`, point `VITE_API_URL` to your live backend domain.

---

## 📡 Backend REST API Specification

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new candidate account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate candidate & return JWT token | ❌ No |
| `GET` | `/api/auth/me` | Fetch authenticated candidate profile | ✅ Yes |
| `GET` | `/api/interviews` | List completed interviews for candidate | ✅ Yes |
| `POST` | `/api/interviews` | Save mock interview session & AI evaluation | ✅ Yes |
| `GET` | `/api/health` | Backend status & system health check | ❌ No |

---

## 🛠️ Technology Stack

* **Frontend Framework**: React 19, Vite 8, React Router DOM 7
* **Styling & UI**: Tailwind CSS v4 (OKLCH color system), Framer Motion, Lucide Icons, Radix UI Primitives, Sonner Notifications
* **Speech & Audio**: Web Audio API `AudioContext` with autoGainControl, Web Speech Recognition (`webkitSpeechRecognition`), Browser SpeechSynthesis
* **AI & Machine Learning**: Google Gemini 1.5 Flash Multimodal (Audio & Text)
* **Backend Architecture**: Java 21, Spring Boot 3.3, Spring Security with JWT Filters, Spring Data JPA
* **Database**: MySQL 8 / H2 in-memory mode

---

## 👨‍💻 Author & Maintainer

Developed by **Arvind Waghmale** as part of the Java Full Stack Placement Preparation Project.
- **GitHub**: [@ArvindWaghmale45](https://github.com/ArvindWaghmale45)
- **Repository**: [HireSense-AI-Placement-Assistant](https://github.com/ArvindWaghmale45/HireSense-AI-Placement-Assistant)

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
