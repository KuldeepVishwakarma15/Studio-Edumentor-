# EduMentor AI — Student Dropout Prevention & Smart Learning Assistant 🎓🚀

**EduMentor AI** is a production-grade, AI-driven Early-Warning Student Retention & Academic Mentorship Platform. It empowers higher-education institutions, academic deans, faculty proctors, and students to predict dropout risks early, understand root causes via Explainable AI (SHAP factors), simulate remedial interventions in real-time, and chat with an intelligent academic mentor.

---

## 🌟 Key Capabilities & Highlights

### 1. 📊 Institutional Executive Dashboard & Analytics
- **Macro Risk Tiers**: Instant visibility across institutional cohorts into High Risk, Medium Risk, and Low Risk student populations.
- **Interactive Timeline Trends**: Dynamic trend graphs toggleable between **Weekly** and **Monthly** intervals (August through January) to monitor risk reduction over the academic semester.
- **Key Attrition Drivers**: Granular breakdown of leading causes of academic distress—including Attendance Shortfalls (<75% AICTE cutoff), Academic Performance / SGPA drop, Tuition Fee Arrears, and Travel Distance / Commute challenges.

### 2. 📋 At-Risk Student Roster & Cohort Management
- **Smart Filtering & Search**: Filter students by risk level (High / Medium / Low), branch/department (CSE, ECE, ME, Civil, AI & DS), or search directly by Student Name or University Roll Number.
- **CSV Data Export**: One-click administrative report export for proctorial boards and academic committees.
- **Direct Student Actions**: One-click access to open a student's profile or initiate an AI proctoring dialogue.

### 3. 👤 Deep-Dive Student Profile & What-If Risk Simulator
- **Comprehensive Academic Dossier**: Historical SGPA / CGPA, verified attendance percentage, backlog count, fee status, and scholarship tags.
- **Explainable AI (SHAP-inspired Factor Decomposition)**: Transparently highlights top positive factors (protective drivers) and negative factors (risk drivers) determining each student's risk profile.
- **Interactive What-If Simulation Engine**: Sliders allow faculty to adjust hypothetical parameters (attendance rate, completed credits, SGPA target, fee payment status) and witness instant recalculation of predicted dropout probability.
- **Counseling Intervention Logger**: Document counseling notes, assigned remedial classes, and financial assistance with full status tracking.

### 4. 📝 Student Self-Registration & Personal Login (`+ Add / Register My Record`)
- Enables students to self-enroll by entering their current academic, financial, and personal details.
- Runs an instant Machine Learning risk score calculation upon submission.
- Automatically transitions the active session to **Student Role**, logging them in under their personal name, displaying their initials on the profile badge, and rendering their personalized dashboard.
- Saves records to local browser storage (`localStorage`) to persist data across page refreshes.

### 5. 🤖 Bilingual AI Academic Mentor (EduMentor AI)
- Conversational study assistant powered by the Google Gemini API (`@google/genai`).
- Bilingual counseling support in **English** and **Hindi / Hinglish**.
- Delivers customized 4-week exam recovery schedules, coding & DSA study roadmaps, AICTE 75% attendance policy guidance, scholarship opportunities, and stress-management support.
- Automatic distress detection that escalates to human proctors and confidential helplines (such as Tele-MANAS).

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion) |
| **Backend** | Node.js, Express, tsx |
| **AI / Machine Learning** | `@google/genai` (Google Gemini Flash), Client-Side Surrogate ML Prediction Engine |
| **Build Tool & Bundler** | Vite 6 / Vite 8 |
| **Deployment Platforms** | Vercel, Render, Railway, Google Cloud Run |

---

## ⚡ Deployment to Vercel (One-Click / Step-by-Step)

This project is pre-configured for seamless deployment to **Vercel**:

### Why Vercel Deployments Previously Failed:
- In strict npm environments, conflicting peer dependencies between `esbuild` and `vite` caused `npm error code ERESOLVE`.
- **Solution applied**: Conflicting peer packages were removed, `.npmrc` is configured with `legacy-peer-deps=true`, and `vercel.json` provides automated SPA routing.

### Steps to Deploy on Vercel:

1. **Push to GitHub**:
   Commit and push this repository to your GitHub account.

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** > **"Project"**.
   - Select your GitHub repository.

3. **Configure Project Settings on Vercel**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install` (or leave default; `.npmrc` ensures clean resolution)

4. **Environment Variables (Optional for Live Gemini AI)**:
   - In Vercel Project Settings > **Environment Variables**, add:
     - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API key)*
   > **Note**: Even without configuring an API key on Vercel, EduMentor AI works instantly using its built-in Intelligent Q&A Engine. You can also paste your Gemini API Key directly inside the app using the **"AI Key"** button in the chat header!

5. **Deploy**:
   Click **Deploy**. Your live URL will be ready in under 1 minute!

---

## 💻 Running Locally

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm** or **bun**: (`npm -v`)

### 2. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repository-url>
cd <repository-directory>

# Install packages
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Gemini API Key inside `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Start the Development Server

```bash
npm run dev
```

Open your browser and navigate to:
👉 **`http://localhost:3000`**

### 5. Build for Production

```bash
# Build the optimized production bundle
npm run build

# Start the Node.js production server
npm start
```

---

## 📂 Project Architecture

```text
├── .npmrc                         # Configures npm legacy-peer-deps for Vercel builds
├── vercel.json                    # Vercel deployment & SPA rewrite routing
├── server.ts                      # Express API server (Gemini AI endpoints & static hosting)
├── vite.config.ts                 # Vite bundler & Tailwind configuration
├── package.json                   # Project scripts and dependencies
├── src/
│   ├── components/
│   │   ├── AddStudentRecordModal.tsx   # Self-registration modal with instant ML scoring
│   │   ├── AIMentorChatView.tsx        # EduMentor AI chat dialog with bilingual support
│   │   ├── AtRiskRosterView.tsx        # High-risk cohort table, search & CSV export
│   │   ├── Header.tsx                  # Top branding bar with role switcher
│   │   ├── MentorChatModal.tsx         # Quick popup mentor interaction
│   │   ├── OverviewView.tsx            # Institutional analytics & risk distribution charts
│   │   └── StudentProfileView.tsx      # Student dossier, SHAP factors & What-If simulator
│   ├── data/
│   │   ├── uciStudents.ts              # Pre-populated student records and risk metadata
│   │   └── modulesContent.ts           # Academic curriculum reference data
│   ├── App.tsx                         # Core application router, state & sidebar manager
│   ├── main.tsx                        # React 19 application mount point
│   └── index.css                       # Tailwind CSS v4 styling rules
└── README.md                           # Documentation and deployment manual
```

---

## 👥 User Roles & Personas

- **Dean / Institutional Administrator**: Provides aggregate dropout telemetry, semester retention trends, and department-level comparisons.
- **Counselor / Faculty Proctor**: Accesses prioritized at-risk rosters, logs counseling interventions, and runs What-If simulations to structure remedial plans.
- **Student**: Accesses personalized academic status, reviews attendance and credit clearance, experiments with What-If scenarios, and engages with EduMentor AI for guidance.

---

## 📄 License
MIT License. Built for student retention excellence and educational empowerment.
