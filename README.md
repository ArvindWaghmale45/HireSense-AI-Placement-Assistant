# HireSense: Your Interview Edge

🚀 HireSense — Complete Project Plan

1. 🎯 Project Idea

HireSense is a placement and interview preparation platform for students/job seekers.

The main purpose is to help a student:

 Prepare for placements

 Practice mock interviews

 Get AI-powered interview feedback

 Practice aptitude/technical/HR questions

 Ask an AI career assistant for guidance

 Track their profile and performance

The project will be a simple but complete full-stack application, not an enormous platform.

2. 🧩 Final Features

We divide everything into three categories.

🟢 A. Features We Build Now

These are the features that must actually work.

1. 🏠 Landing Page

The first page users see.

Contains:

 HireSense logo/name

 Navigation

 Introduction/hero section

 What HireSense does

 Main features

 Login button

 Register button

 CTA such as Start Preparing

2. 📝 Register

User creates an account.

Basic information:

Name
Email
Password
Confirm Password

Backend:

React
   ↓
Spring Boot
   ↓
UserController
   ↓
UserService
   ↓
UserRepository
   ↓
PostgreSQL

We keep registration simple.

3. 🔐 Login / Authentication

User logs into HireSense.

Email
Password
   ↓
Spring Boot
   ↓
Authentication
   ↓
Dashboard

We already have Spring Security in the backend.

We'll avoid unnecessary authentication complexity unless we actually need it.

4. 👤 Profile + Analytics

This is not just a basic profile.

We'll have a simple student dashboard/profile containing:

Profile

Name
Email
Skills
Education
Target Role

Analytics

Interviews Completed
Average Interview Score
Best Score
Placement Practice Progress

Potentially:

Technical Interview: 8/10
HR Interview: 7/10
Aptitude: 75%

We don't need complicated charts everywhere. A few useful statistics are enough.

5. 🎤 Mock Interview — MAIN FEATURE

This is the most important feature of HireSense.

Step 1 — Select Interview

User chooses:

Interview Type
----------------
Technical
HR

Difficulty:

Easy
Medium
Hard

Number of questions:

5
10

Step 2 — Interview

Example:

Question 1 of 5

What is inheritance in Java?

User enters answer.

[ Write your answer here... ]

             Next

Questions can initially come from our database.

Step 3 — AI Evaluation

After the user submits an answer:

User Answer
     ↓
Spring Boot
     ↓
AI API
     ↓
AI evaluates answer
     ↓
Score + Feedback

The AI can evaluate things such as:

 Correctness

 Relevance

 Explanation

 Missing concepts

 Overall quality

Example:

Score: 8/10

Good explanation of inheritance.

You correctly mentioned:
✓ Parent class
✓ Child class
✓ Code reusability

Improve:
• Explain method overriding
• Give a small example

Step 4 — Final Result

After the interview:

Interview Completed 🎉

Score: 8/10

Questions: 5
Attempted: 5

Strengths:
Good understanding of Java basics.

Areas to Improve:
Inheritance and polymorphism.

AI Feedback:
Keep practicing Java OOP concepts.

Step 5 — Save History

The result is stored.

Later:

Interview History

Java Technical
8/10
7 Sep 2026

HR Interview
7/10
6 Sep 2026

This connects directly with Profile Analytics.

6. 🎯 Placement Preparation

We WILL implement this, but keep it simple.

Main categories:

Placement Preparation
│
├── Aptitude
├── Technical
└── HR

Aptitude

Examples:

 Quantitative aptitude

 Logical reasoning

 Verbal ability

User answers MCQs.

Then:

Score
Correct Answers
Wrong Answers

Technical

Questions around:

 Java

 OOP

 DBMS

 SQL

 HTML/CSS

 JavaScript

 Basic programming

HR

Questions such as:

 Tell me about yourself.

 What are your strengths?

 Why should we hire you?

 Where do you see yourself in five years?

For the first version, we don't need an enormous question bank.

7. 🤖 AI Career Assistant

We will also implement this.

Simple chat interface:

┌─────────────────────────────┐
│     AI Career Assistant     │
├─────────────────────────────┤
│                             │
│ AI: How can I help you?     │
│                             │
│ You: How should I prepare   │
│      for a Java interview?  │
│                             │
│ AI: ...                     │
│                             │
├─────────────────────────────┤
│ Type your question...       │
│                         Send│
└─────────────────────────────┘

Examples:

How do I prepare for a Java interview?

What should I learn for a software developer placement?

Explain polymorphism.

Give me a 30-day placement plan.

8. 🔌 AI API Integration

This is an important part of our project.

We don't want the React frontend directly calling the AI provider.

Instead:

React
  ↓
Spring Boot
  ↓
AI Service
  ↓
AI API
  ↓
Spring Boot
  ↓
React

Why?

Because the API key should remain on the backend, not inside frontend JavaScript.

We'll make the AI integration as simple as possible.

🔵 Features We DON'T Build Now

These will exist in the UI as Coming Soon.

📄 Resume Analyzer

Resume Analyzer

Upload your resume and get
AI-powered resume feedback.

       Coming Soon

💼 Job Matching

Job Matching

Find jobs based on your
skills and profile.

       Coming Soon

📊 Skill Analysis

Skill Analysis

Analyze your skills and
identify areas for improvement.

       Coming Soon

These features can be developed later when we have more time.

9. 🖥️ Frontend Structure

We'll keep React straightforward.

frontend/
│
├── package.json
├── vite.config.js
├── index.html
│
├── public/
│
└── src/
    │
    ├── main.jsx
    ├── App.jsx
    ├── App.css
    ├── index.css
    │
    ├── assets/
    │
    └── pages/
        │
        ├── LandingPage.jsx
        ├── LandingPage.css
        │
        ├── Login.jsx
        ├── Login.css
        │
        ├── Register.jsx
        ├── Register.css
        │
        ├── Profile.jsx
        ├── Profile.css
        │
        ├── MockInterview.jsx
        ├── MockInterview.css
        │
        ├── PlacementPreparation.jsx
        ├── PlacementPreparation.css
        │
        ├── AIAssistant.jsx
        ├── AIAssistant.css
        │
        ├── ResumeAnalyzer.jsx
        ├── JobMatching.jsx
        └── SkillAnalysis.jsx

We'll add components/services only when they are genuinely needed.

10. ☕ Backend Structure

Simple Spring Boot architecture:

backend/
│
├── pom.xml
│
└── src/
    └── main/
        ├── java/
        │   └── com/hiresense/backend/
        │
        │       ├── BackendApplication.java
        │       │
        │       ├── config/
        │       │   └── SecurityConfig.java
        │       │
        │       ├── controller/
        │       │   ├── AuthController.java
        │       │   ├── ProfileController.java
        │       │   ├── MockInterviewController.java
        │       │   ├── PlacementPreparationController.java
        │       │   └── AIAssistantController.java
        │       │
        │       ├── service/
        │       │   ├── AuthService.java
        │       │   ├── ProfileService.java
        │       │   ├── MockInterviewService.java
        │       │   ├── PlacementPreparationService.java
        │       │   └── AIAssistantService.java
        │       │
        │       ├── entity/
        │       │   ├── User.java
        │       │   ├── MockInterview.java
        │       │   ├── InterviewQuestion.java
        │       │   ├── InterviewAnswer.java
        │       │   └── InterviewFeedback.java
        │       │
        │       ├── repository/
        │       │   ├── UserRepository.java
        │       │   ├── MockInterviewRepository.java
        │       │   ├── InterviewQuestionRepository.java
        │       │   ├── InterviewAnswerRepository.java
        │       │   └── InterviewFeedbackRepository.java
        │       │
        │       └── dto/
        │           ├── LoginRequest.java
        │           ├── RegisterRequest.java
        │           ├── InterviewRequest.java
        │           ├── AnswerRequest.java
        │           └── AIRequest.java
        │
        └── resources/
            └── application.properties

We can simplify this further if a class isn't actually necessary.

11. 🗄️ PostgreSQL Database

Our main data flow will be approximately:

User
 │
 ├── Profile information
 │
 └── Mock Interviews
        │
        ├── Questions
        │
        ├── Answers
        │
        └── Feedback

Possible tables:

users
interviews
interview_questions
interview_answers
interview_feedback

For Placement Preparation, we can add the required tables only when we implement that module.

We won't create 20 tables just for the sake of architecture.

12. 🔄 Complete System Flow

The final working flow should look like this:

                     HIRE SENSE
                         │
                         ▼
                  🏠 Landing Page
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          Register                 Login
                                    │
                                    ▼
                              👤 Dashboard
                                    │
            ┌───────────────┬───────┼───────────────┐
            ▼               ▼       ▼               ▼
       🎤 Mock         🎯 Placement 👤 Profile   🤖 AI
       Interview       Preparation  & Analytics  Assistant
            │
            ▼
       Select Interview
            │
            ▼
       Get Questions
            │
            ▼
       User Answers
            │
            ▼
         AI API
            │
            ▼
       Evaluation
            │
            ▼
      Score + Feedback
            │
            ▼
        Save Result
            │
            ▼
       Profile Analytics

13. 🧠 AI Architecture

We have two main AI use cases.

Mock Interview

Question
   +
User Answer
   ↓
AI API
   ↓
Evaluation
   ↓
Score
Feedback
Suggestions

AI Assistant

User Question
      ↓
AI API
      ↓
AI Response

We can potentially use the same AI provider/API for both, which keeps the implementation simpler.

14. 🛠️ Technology Stack

Frontend

 React

 JavaScript

 HTML

 CSS

 Vite

Backend

 Java

 Spring Boot

 Spring Data JPA

 Spring Security

 REST APIs

Database

 PostgreSQL

AI

 AI API

 Backend-based API integration

Development Tools

 VS Code

 Eclipse/IntelliJ if needed

 Postman

 Git

 GitHub


## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
