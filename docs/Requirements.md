
# 📐 Architectural Requirements – *Memoirly*

## 1. 🧭 Overview

**Memoirly** is a media journaling and memory curation web application that allows users to upload, organize, and relive their most precious memories through photos, videos, and AI-generated memory compilations. This document outlines the architectural requirements to ensure scalability, maintainability, performance, and developer efficiency.

---

## 2. 🧱 System Goals & Non-Functional Requirements

| **Goal**                                | **Description**                                                                 |
|-----------------------------------------|---------------------------------------------------------------------------------|
| **Scalability**                         | The system must handle growing numbers of users, uploads, and requests.         |
| **Responsiveness**                      | Provide seamless UX across mobile, tablet, and desktop.                         |
| **Developer Velocity**                 | Enable rapid feature iteration and collaboration across teams.                  |
| **Low Latency**                         | Optimize for fast media loading and smooth video playback.                      |
| **Security & Access Control**           | Ensure authenticated access and secure data handling.                           |
| **Fault Tolerance**                     | Gracefully handle service disruptions or API failures.                          |
| **Modularity**                          | Support clear separation of concerns for easier testing and scaling.            |
| **Portability**                         | Allow future migration from one cloud service to another, if needed.            |

---

## 3. 🧩 Target Architecture Summary

### 💻 Frontend (Client-Side)
- **Framework**: React.js (Vite or CRA)
- **Styling**: TailwindCSS
- **Routing**: React Router
- **State Management**: Context API or Redux Toolkit
- **Animations**: Framer Motion
- **Media Processing**: ffmpeg.wasm

### ☁️ Backend & Services

| Component     | Technology        | Purpose                                 |
|---------------|-------------------|-----------------------------------------|
| **Auth**       | Clerk             | Authentication, session, user management |
| **Database**   | Supabase (PostgreSQL) | Albums, media metadata, journal entries |
| **Storage**    | Cloudinary        | Store & optimize image/video media       |
| **Hosting**    | Vercel            | Frontend deployment                      |

---

## 4. 🧱 Architectural Constraints

- Use **only serverless-compatible** backend services (Supabase, Cloudinary, Clerk).
- All media uploads must be **public-read** but scoped to authenticated users.
- All operations must be **mobile-first and PWA-compatible**.
- Third-party libraries must be **actively maintained** and **lightweight** where possible.

---

## 5. ⚙️ Technology Requirements

| Category              | Requirement                                                       |
|-----------------------|-------------------------------------------------------------------|
| **Framework**         | React.js with modular components and hooks                        |
| **State Management**  | Context API (light), fallback to Redux Toolkit (if needed)        |
| **Media Upload**      | Cloudinary API integration                                        |
| **Video Generation**  | ffmpeg.wasm (client-side, fallback optional)                      |
| **Routing**           | Dynamic routes with React Router                                  |
| **Styling**           | TailwindCSS with utility classes and dark mode                    |
| **Testing**           | Unit tests (Jest), E2E (Playwright or Cypress - future expansion) |
| **CI/CD**             | GitHub Actions for lint/build/deploy                              |

---

## 6. 🔐 Security Requirements

- **JWT sessions managed by Clerk**
- **RLS in Supabase**: enforce that users only access their own data
- **CSP Headers**: restrict content origins via Vercel settings
- **API Keys in .env files**, not embedded in client code
- **Rate-limiting** and abuse protection (Clerk & Supabase settings)

---

## 7. 🧪 Testing Strategy (Optional MVP Scope)

| Layer        | Testing Type         | Tool               |
|--------------|----------------------|--------------------|
| UI           | Component Testing     | React Testing Library |
| API/Logic    | Unit Testing          | Jest               |
| End-to-End   | Manual for MVP, Playwright in V2 |

---

## 8. 📦 Deployment Requirements

- **CI/CD**: Use GitHub Actions or Vercel’s auto-deploy pipelines
- **Preview URLs**: All pull requests should have preview deployments
- **Environment Variables** managed via Vercel dashboard
- **Logs and Errors** should be monitored via Vercel or Sentry (optional)

---

## 9. 📐 Documentation Requirements

- **README** must include:
  - Tech stack
  - Setup instructions
  - Feature summary
  - Build/run instructions
  - Link to live app & demo video
- **Codebase** should have:
  - Inline JSDoc for core logic
  - Commented custom hooks and data fetchers
