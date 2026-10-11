# EduMentor AI — Student Dropout Prevention & Smart Learning Assistant 🎓🚀

An AI/ML-powered Early-Warning & Student Retention Intelligence Platform built with **React 19**, **Express**, **Tailwind CSS v4**, and **Google Gemini AI**.

It enables institutions, counselors, and students to predict dropout risk early, understand risk factors through SHAP-inspired explainability, simulate academic interventions with a What-If engine, chat with a bilingual AI Mentor (Hindi & English), and allow students to register and manage their own academic records.

---

## 📌 Key Features

1. **📊 Executive Overview & Analytics**:
   - Institutional dropout risk metrics (High / Medium / Low Risk distribution).
   - Interactive trend charts with Monthly (Aug, Sep, Oct, Nov, Dec, Jan) and Weekly timeline toggle.
   - Key dropout driver breakdowns (Attendance, Academic performance, Fee clearance, Distance, Backlogs).

2. **📋 At-Risk Student Roster**:
   - Comprehensive roster of enrolled students with real-time risk scores and category tags.
   - Search by name, roll number, or department.
   - Filter by risk tier (All, High Risk, Medium, Low) and branch (CSE, ECE, ME, etc.).
   - Quick export to CSV for administrative reporting.

3. **👤 Student Profile & What-If Risk Simulator**:
   - Detailed individual breakdown with attendance gauges, SGPA/CGPA history, and fee clearance status.
   - **Explainable AI (SHAP factors)** highlighting positive and negative drivers influencing risk.
   - **Interactive What-If Simulation**: Adjust attendance, study hours, or backlog status via sliders to see real-time recalculated dropout risk percentage.
   - **Log Counseling Intervention**: Document counselor notes, remedial plans, and status tracking without text cutoff bugs.

4. **✨ Self-Registration & Personal Student Login (`+ Add / Register My Record`)**:
   - Students can self-register their academic and financial details directly.
   - Calculates instant Machine Learning dropout risk upon submission.
   - Automatically switches user role to **Student** and logs them in with their personal name, avatar initials, and student record view.
   - Saves record locally to `localStorage` so data persists across refreshes.

5. **🤖 Bilingual AI Mentor (EduMentor AI)**:
   - AI conversational mentor powered by Gemini API.
   - Supports counseling in English and Hindi (Hinglish).
   - Provides personalized academic recovery schedules, mental health coping mechanisms, and scholarship information.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion)
- **Backend / Server**: Node.js, Express, tsx
- **AI / LLM**: `@google/genai` (Google Gemini API)
- **Bundler**: Vite 6+

---

## 🚀 Getting Started / Kaise Run Karein (Step-by-Step Guide)

### 1. Prerequisites (Pehle ye ensure karein)
- **Node.js**: Version 18+ ya 20+ installed hona chahiye (`node -v` se check karein).
- **npm** ya **bun**: Package manager installed hona chahiye (`npm -v`).
- **Gemini API Key**: Google AI Studio se free Gemini API Key prapt karein (AI Mentor feature ke liye).

---

### 2. Installation (Dependencies install karna)

Repository clone ya download karne ke baad project folder ke andar terminal open karein:

```bash
# Dependencies install karein
npm install
```

---

### 3. Environment Variables Setup (`.env`)

Root folder me ek `.env` file banayein (`.env.example` ko copy karke):

```bash
cp .env.example .env
```

`.env` file me apni Google Gemini API Key add karein:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=3000
```

> **Note**: Agar Gemini API key nahi bhi dali hai, tab bhi basic application, ML dropout prediction calculations, roster, self-registration aur graphs poori tarah kaam karenge. AI Mentor chat ke liye key zaroori hai.

---

### 4. Run Development Server (App start karna)

Development server ko start karne ke liye ye command chalayein:

```bash
npm run dev
```

Server start hone ke baad browser me open karein:
👉 **`http://localhost:3000`**

---

### 5. Production Build (Deploy karne ke liye)

Production build generate karne ke liye:

```bash
# Build React bundle
npm run build

# Start production server
npm start
```

---

## 📁 Project Structure (Folder Structure)

```text
├── src/
│   ├── components/
│   │   ├── AddStudentRecordModal.tsx   # Student self-registration & ML risk modal
│   │   ├── AtRiskRosterView.tsx        # At-risk students roster & search/filter
│   │   ├── Header.tsx                  # Top navigation bar with EduMentor AI branding
│   │   ├── MentorChatModal.tsx         # AI Mentor conversational chat interface
│   │   ├── OverviewView.tsx            # Analytics dashboard & interactive trend charts
│   │   └── StudentProfileView.tsx      # Student profile, SHAP factors & What-If simulator
│   ├── data/
│   │   └── uciStudents.ts              # Pre-seeded student records & UCI dataset factors
│   ├── App.tsx                         # Main app routing, state & sidebar profile manager
│   ├── main.tsx                        # React DOM root entry point
│   └── index.css                       # Global Tailwind CSS directives
├── server.ts                           # Express server + Gemini AI endpoints + Vite middleware
├── package.json                        # Scripts and dependencies
├── vite.config.ts                      # Vite configuration
└── README.md                           # Documentation & guide
```

---

## 💡 Quick Tips & Workflow

- **Sidebar Role Switcher**: Top-left sidebar me jakar aap role switch kar sakte hain:
  - `Dean / Administrator`: Institutional overview and macro analytics.
  - `Counselor / Faculty`: Focuses on at-risk rosters and student counseling interventions.
  - `Student`: Personalized view for student's own risk profile and AI mentor support.
- **Add New Student**: Click on **`+ Add / Register My Record`** (sidebar ya top-right buttons me) to fill student details, predict risk, aur apna personal login create karein!

---

## 📜 License
MIT License. Created for AICTE-IBM Bharat Cares Educational Initiatives.
